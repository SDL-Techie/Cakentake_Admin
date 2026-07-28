"""
Agent Module routes.

Reuses (does NOT duplicate):
    - models.user.User            (role="AGENT", extended with is_active,
                                    created_by, default_discount)
    - models.product.Product      (normal bakery catalog, unchanged)
    - models.order.Order / OrderItem (order_type="agent_order", created_by=agent.id;
                                    Order already had customer_name / customer_phone /
                                    customer_email snapshot columns reserved for this)
    - models.address.Address, models.area.Area, models.currency_rate.CurrencyRate
    - middleware.role.role_required
    - services.order_history_service.log_order_status

New tables (models/agent.py), none of which duplicate existing data:
    - agent_menus
    - agent_menu_products      (link table -> products.id)
    - agent_menu_assignments   (link table -> users.id)
"""

import random
from datetime import datetime, date
from decimal import Decimal, InvalidOperation

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from middleware.role import role_required

from models.user import User
from models.product import Product
from models.order import Order
from models.order_item import OrderItem
from models.address import Address
from models.area import Area
from models.currency_rate import CurrencyRate
from models.agent import AgentMenu, AgentMenuProduct, AgentMenuAssignment
from services.order_history_service import log_order_status

agent_bp = Blueprint("agent", __name__)

ROLE_OWNER_LIST = ["ADMIN", "SHOP_MANAGER"]
ROLE_AGENT = "AGENT"


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


def generate_order_number():
    return f"CT-AGT-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"


def _agent_or_404(agent_id):
    return User.query.filter_by(id=agent_id, role=ROLE_AGENT).first()


def _order_belongs_to_agent(order, agent):
    return order.created_by == agent.id and order.order_type == "agent_order"


# ─── Step 2: Owner creates / manages Agents ───────────────────────────────────

@agent_bp.route("/owner/agents", methods=["POST"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def create_agent():
    owner = get_current_user()
    data = request.get_json() or {}

    required = ["first_name", "last_name", "phone_no", "email", "password"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400
    if User.query.filter_by(phone_no=data["phone_no"]).first():
        return jsonify({"error": "Phone number already exists"}), 400

    try:
        default_discount = Decimal(str(data.get("default_discount", 0) or 0))
    except (InvalidOperation, TypeError, ValueError):
        return jsonify({"error": "Invalid default_discount value"}), 400

    if default_discount < 0 or default_discount > 100:
        return jsonify({"error": "default_discount must be between 0 and 100"}), 400

    agent = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone_no=data["phone_no"],
        email=data["email"],
        role=ROLE_AGENT,
        is_active=True,
        created_by=owner.id,
        default_discount=default_discount
    )
    agent.set_password(data["password"])

    db.session.add(agent)
    db.session.commit()

    return jsonify({"message": "Agent created", "agent": agent.to_dict()}), 201


@agent_bp.route("/owner/agents", methods=["GET"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def list_agents():
    active_only = request.args.get("active")
    query = User.query.filter_by(role=ROLE_AGENT)
    if active_only == "true":
        query = query.filter_by(is_active=True)
    elif active_only == "false":
        query = query.filter_by(is_active=False)

    agents = query.order_by(User.created_at.desc()).all()
    return jsonify({"agents": [a.to_dict() for a in agents]}), 200


@agent_bp.route("/owner/agents/<int:agent_id>", methods=["GET"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def get_agent(agent_id):
    agent = _agent_or_404(agent_id)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404
    return jsonify({"agent": agent.to_dict()}), 200


@agent_bp.route("/owner/agents/<int:agent_id>", methods=["PUT"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def update_agent(agent_id):
    agent = _agent_or_404(agent_id)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    data = request.get_json() or {}

    if "email" in data and data["email"] != agent.email:
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Email already exists"}), 400

    if "phone_no" in data and data["phone_no"] != agent.phone_no:
        if User.query.filter_by(phone_no=data["phone_no"]).first():
            return jsonify({"error": "Phone number already exists"}), 400

    for field in ["first_name", "last_name", "phone_no", "email"]:
        if field in data:
            setattr(agent, field, data[field])

    if data.get("password"):
        agent.set_password(data["password"])

    db.session.commit()
    return jsonify({"message": "Agent updated", "agent": agent.to_dict()}), 200


@agent_bp.route("/owner/agents/<int:agent_id>", methods=["DELETE"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def delete_agent(agent_id):
    agent = _agent_or_404(agent_id)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    has_orders = Order.query.filter_by(created_by=agent.id).first() is not None
    if has_orders:
        return jsonify({
            "error": (
                "This agent has existing orders and cannot be deleted. "
                "Deactivate the agent instead."
            )
        }), 400

    try:
        db.session.delete(agent)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        return jsonify({"error": f"Unable to delete agent: {str(error)}"}), 400

    return jsonify({"message": "Agent deleted"}), 200


@agent_bp.route("/owner/agents/<int:agent_id>/status", methods=["PATCH"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def set_agent_status(agent_id):
    agent = _agent_or_404(agent_id)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    data = request.get_json() or {}
    if "active" not in data:
        return jsonify({"error": "'active' (true/false) is required"}), 400

    agent.is_active = bool(data["active"])
    db.session.commit()

    return jsonify({
        "message": "Agent activated" if agent.is_active else "Agent deactivated",
        "agent": agent.to_dict()
    }), 200


@agent_bp.route("/owner/agents/<int:agent_id>/reset-password", methods=["POST"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def reset_agent_password(agent_id):
    agent = _agent_or_404(agent_id)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    data = request.get_json() or {}
    new_password = data.get("password")
    if not new_password or len(new_password) < 6:
        return jsonify({"error": "password (min 6 characters) is required"}), 400

    agent.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password reset successfully"}), 200


@agent_bp.route("/owner/agents/<int:agent_id>/discount", methods=["PATCH"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def set_agent_discount(agent_id):
    agent = _agent_or_404(agent_id)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    data = request.get_json() or {}
    if "default_discount" not in data:
        return jsonify({"error": "default_discount is required"}), 400

    try:
        discount = Decimal(str(data["default_discount"]))
    except (InvalidOperation, TypeError, ValueError):
        return jsonify({"error": "Invalid default_discount value"}), 400

    if discount < 0 or discount > 100:
        return jsonify({"error": "default_discount must be between 0 and 100"}), 400

    agent.default_discount = discount
    db.session.commit()

    return jsonify({
        "message": "Agent discount updated",
        "agent": agent.to_dict()
    }), 200


# ─── Step 3: Owner manages private Agent Menus ────────────────────────────────

@agent_bp.route("/owner/agent-menus", methods=["GET"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def list_agent_menus():
    menus = AgentMenu.query.order_by(AgentMenu.created_at.desc()).all()
    return jsonify({"agent_menus": [m.to_dict() for m in menus]}), 200


@agent_bp.route("/owner/agent-menus", methods=["POST"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def create_agent_menu():
    owner = get_current_user()
    data = request.get_json() or {}

    name = data.get("name")
    if not name:
        return jsonify({"error": "name is required"}), 400

    menu = AgentMenu(
        name=name,
        description=data.get("description"),
        is_active=data.get("is_active", True),
        created_by=owner.id
    )
    db.session.add(menu)
    db.session.flush()  # get menu.id

    # Optional: attach products immediately
    product_ids = data.get("product_ids") or []
    for pid in product_ids:
        if Product.query.get(pid):
            db.session.add(AgentMenuProduct(agent_menu_id=menu.id, product_id=pid))

    # Optional: assign agents immediately
    agent_ids = data.get("agent_ids") or []
    for aid in agent_ids:
        if _agent_or_404(aid):
            db.session.add(AgentMenuAssignment(
                agent_menu_id=menu.id, agent_id=aid, assigned_by=owner.id
            ))

    db.session.commit()
    return jsonify({"message": "Agent menu created", "agent_menu": menu.to_dict()}), 201


@agent_bp.route("/owner/agent-menus/<int:menu_id>", methods=["GET"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def get_agent_menu(menu_id):
    menu = AgentMenu.query.get_or_404(menu_id)
    return jsonify({"agent_menu": menu.to_dict()}), 200


@agent_bp.route("/owner/agent-menus/<int:menu_id>", methods=["PUT"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def update_agent_menu(menu_id):
    menu = AgentMenu.query.get_or_404(menu_id)
    data = request.get_json() or {}

    for field in ["name", "description", "is_active"]:
        if field in data:
            setattr(menu, field, data[field])

    db.session.commit()
    return jsonify({"message": "Agent menu updated", "agent_menu": menu.to_dict()}), 200


@agent_bp.route("/owner/agent-menus/<int:menu_id>", methods=["DELETE"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def delete_agent_menu(menu_id):
    menu = AgentMenu.query.get_or_404(menu_id)
    db.session.delete(menu)  # cascades to products + assignments
    db.session.commit()
    return jsonify({"message": "Agent menu deleted"}), 200


@agent_bp.route("/owner/agent-menus/<int:menu_id>/products", methods=["POST"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def add_products_to_menu(menu_id):
    menu = AgentMenu.query.get_or_404(menu_id)
    data = request.get_json() or {}

    product_ids = data.get("product_ids")
    if not isinstance(product_ids, list) or not product_ids:
        return jsonify({"error": "product_ids (non-empty list) is required"}), 400

    existing_ids = {mp.product_id for mp in menu.products}
    added, skipped_missing = [], []

    for pid in product_ids:
        if pid in existing_ids:
            continue
        product = Product.query.get(pid)
        if not product:
            skipped_missing.append(pid)
            continue
        db.session.add(AgentMenuProduct(agent_menu_id=menu.id, product_id=pid))
        added.append(pid)

    db.session.commit()
    db.session.refresh(menu)

    return jsonify({
        "message": "Products added to menu",
        "added_product_ids": added,
        "skipped_missing_product_ids": skipped_missing,
        "agent_menu": menu.to_dict()
    }), 200


@agent_bp.route("/owner/agent-menus/<int:menu_id>/products/<int:product_id>", methods=["DELETE"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def remove_product_from_menu(menu_id, product_id):
    link = AgentMenuProduct.query.filter_by(
        agent_menu_id=menu_id, product_id=product_id
    ).first()
    if not link:
        return jsonify({"error": "Product is not on this menu"}), 404

    db.session.delete(link)
    db.session.commit()
    return jsonify({"message": "Product removed from menu"}), 200


@agent_bp.route("/owner/agent-menus/<int:menu_id>/assign-agent", methods=["POST"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def assign_agent_to_menu(menu_id):
    owner = get_current_user()
    menu = AgentMenu.query.get_or_404(menu_id)
    data = request.get_json() or {}

    agent_id = data.get("agent_id")
    if not agent_id:
        return jsonify({"error": "agent_id is required"}), 400

    agent = _agent_or_404(agent_id)
    if not agent:
        return jsonify({"error": "Agent not found"}), 404

    existing = AgentMenuAssignment.query.filter_by(
        agent_menu_id=menu.id, agent_id=agent.id
    ).first()
    if existing:
        return jsonify({"message": "Agent already assigned to this menu"}), 200

    assignment = AgentMenuAssignment(
        agent_menu_id=menu.id,
        agent_id=agent.id,
        assigned_by=owner.id
    )
    db.session.add(assignment)
    db.session.commit()

    return jsonify({
        "message": "Agent assigned to menu",
        "assignment": assignment.to_dict()
    }), 201


@agent_bp.route("/owner/agent-menus/<int:menu_id>/unassign-agent/<int:agent_id>", methods=["DELETE"])
@jwt_required()
@role_required(ROLE_OWNER_LIST)
def unassign_agent_from_menu(menu_id, agent_id):
    assignment = AgentMenuAssignment.query.filter_by(
        agent_menu_id=menu_id, agent_id=agent_id
    ).first()
    if not assignment:
        return jsonify({"error": "Assignment not found"}), 404

    db.session.delete(assignment)
    db.session.commit()
    return jsonify({"message": "Agent unassigned from menu"}), 200


# ─── Step 4 + 9: Agent-side dashboard / catalog ───────────────────────────────

@agent_bp.route("/agent/products", methods=["GET"])
@jwt_required()
@role_required([ROLE_AGENT])
def agent_products():
    """Source 1: normal bakery products, unchanged/unfiltered by agent."""
    currency = request.headers.get("X-Currency", "KWD")
    products = Product.query.filter_by(is_active=True).all()
    return jsonify({
        "products": [p.to_dict(currency) for p in products]
    }), 200


@agent_bp.route("/agent/menu", methods=["GET"])
@jwt_required()
@role_required([ROLE_AGENT])
def agent_menu():
    """Source 2: private menu(s) assigned specifically to this agent."""
    agent = get_current_user()
    currency = request.headers.get("X-Currency", "KWD")

    assignments = AgentMenuAssignment.query.filter_by(agent_id=agent.id).all()
    menus = [
        a.menu.to_dict(currency)
        for a in assignments
        if a.menu and a.menu.is_active
    ]

    return jsonify({"agent_menu": menus}), 200


@agent_bp.route("/agent/catalog", methods=["GET"])
@jwt_required()
@role_required([ROLE_AGENT])
def agent_catalog():
    """
    Convenience endpoint combining both product sources in the exact shape
    described in the spec: { "products": [...], "agent_menu": [...] }
    """
    agent = get_current_user()
    currency = request.headers.get("X-Currency", "KWD")

    products = Product.query.filter_by(is_active=True).all()

    assignments = AgentMenuAssignment.query.filter_by(agent_id=agent.id).all()
    menus = [
        a.menu.to_dict(currency)
        for a in assignments
        if a.menu and a.menu.is_active
    ]

    return jsonify({
        "products": [p.to_dict(currency) for p in products],
        "agent_menu": menus
    }), 200


@agent_bp.route("/agent/dashboard", methods=["GET"])
@jwt_required()
@role_required([ROLE_AGENT])
def agent_dashboard():
    agent = get_current_user()

    orders = Order.query.filter_by(
        created_by=agent.id, order_type="agent_order"
    ).order_by(Order.created_at.desc()).all()

    today = date.today()
    todays_orders = [o for o in orders if o.created_at and o.created_at.date() == today]

    cancelled_statuses = ("CANCELLED", "REJECTED")

    pending_orders = [o for o in orders if o.status == "PENDING"]
    completed_orders = [o for o in orders if o.status == "DELIVERED"]
    cancelled_orders = [o for o in orders if o.status in cancelled_statuses]

    revenue_orders = [o for o in orders if o.status not in cancelled_statuses]
    todays_revenue_orders = [
        o for o in todays_orders if o.status not in cancelled_statuses
    ]

    total_customers = len({o.user_id for o in orders if o.user_id})

    return jsonify({
        "agent": agent.to_dict(),
        "todays_orders": len(todays_orders),
        "todays_revenue": float(sum(float(o.grand_total or 0) for o in todays_revenue_orders)),
        "pending_orders": len(pending_orders),
        "completed_orders": len(completed_orders),
        "cancelled_orders": len(cancelled_orders),
        "total_orders": len(orders),
        "total_revenue": float(sum(float(o.grand_total or 0) for o in revenue_orders)),
        "total_customers": total_customers,
        "recent_orders": [o.to_dict() for o in orders[:10]],
    }), 200


# ─── Step 6 + 7: Agent orders ──────────────────────────────────────────────────

@agent_bp.route("/agent/orders", methods=["GET"])
@jwt_required()
@role_required([ROLE_AGENT])
def agent_list_orders():
    agent = get_current_user()

    query = Order.query.filter_by(created_by=agent.id, order_type="agent_order")

    status_filter = request.args.get("status")
    if status_filter:
        query = query.filter(Order.status == status_filter.upper())

    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders]}), 200


@agent_bp.route("/agent/orders/<int:order_id>", methods=["GET"])
@jwt_required()
@role_required([ROLE_AGENT])
def agent_get_order(order_id):
    agent = get_current_user()
    order = Order.query.get_or_404(order_id)

    if not _order_belongs_to_agent(order, agent):
        return jsonify({"error": "You do not have access to this order"}), 403

    return jsonify({"order": order.to_dict()}), 200


@agent_bp.route("/agent/orders", methods=["POST"])
@jwt_required()
@role_required([ROLE_AGENT])
def agent_create_order():
    """
    Same flow as the normal customer order (routes/order_routes.py:create_order),
    reusing Order/OrderItem/Product/Address/Area/CurrencyRate, but:
      - order_type is forced to "agent_order"
      - created_by is forced to the logged-in agent's id
      - discount is NOT taken from the client — it is computed automatically
        from the agent's default_discount (Step 5).
    """
    agent = get_current_user()
    data = request.get_json(silent=True) or {}

    address_id = data.get("address_id")
    items_data = data.get("items")

    if not address_id:
        return jsonify({"error": "address_id is required"}), 400
    if not isinstance(items_data, list) or not items_data:
        return jsonify({"error": "Order must contain at least one item"}), 400

    address = Address.query.get(address_id)
    if not address:
        return jsonify({"error": "Address not found"}), 404

    if not address.area_id:
        return jsonify({
            "error": (
                "This address does not have a delivery area. "
                "Please update the address and select an area."
            )
        }), 400

    area = Area.query.filter_by(id=address.area_id, is_active=True).first()
    if not area:
        return jsonify({
            "error": (
                "Delivery is not available for the selected area. "
                "Please contact CakeNTake customer support."
            ),
            "delivery_available": False
        }), 400

    payment_method = str(data.get("payment_method") or "COD").strip().upper()
    allowed_payment_methods = {"COD", "CARD", "STRIPE", "KNET", "UPI", "LINK"}
    if payment_method not in allowed_payment_methods:
        return jsonify({
            "error": "Invalid payment method",
            "allowed_payment_methods": sorted(allowed_payment_methods)
        }), 400

    allowed_currencies = {"INR", "KWD", "AED", "USD", "SAR", "SGD"}
    currency = str(data.get("currency") or "KWD").strip().upper()
    if currency not in allowed_currencies:
        currency = "KWD"

    customer = address.user

    order = Order(
        user_id=address.user_id,
        created_by=agent.id,
        order_number=generate_order_number(),
        order_type="agent_order",
        order_source="AGENT",
        customer_name=(
            f"{customer.first_name} {customer.last_name}".strip()
            if customer else None
        ),
        customer_phone=customer.phone_no if customer else None,
        customer_email=customer.email if customer else None,
        address_id=address.id,
        delivery_area_id=area.id,
        delivery_date=(
            datetime.strptime(data["delivery_date"], "%Y-%m-%d").date()
            if data.get("delivery_date") else None
        ),
        delivery_time_slot=data.get("delivery_time_slot"),
        greeting_message=data.get("greeting_message") or None,
        greeting_from=data.get("greeting_from") or None,
        greeting_to=data.get("greeting_to") or None,
        payment_method=payment_method,
        payment_status="PENDING",
        status="PENDING",
        subtotal=0,
        delivery_charge=0,
        discount=0,
        grand_total=0,
        total=0,
        currency=currency
    )

    try:
        db.session.add(order)
        db.session.flush()

        subtotal = Decimal("0.000")

        for index, item in enumerate(items_data):
            if not isinstance(item, dict):
                raise ValueError(f"Invalid item at position {index + 1}")

            product_id = item.get("product_id")
            if not product_id:
                raise ValueError(f"product_id is required for item {index + 1}")

            product = Product.query.get(product_id)
            if not product:
                raise ValueError(f"Product {product_id} not found")

            try:
                quantity = int(item.get("quantity", 1))
            except (TypeError, ValueError):
                raise ValueError(f"Invalid quantity for product {product_id}")

            if quantity <= 0:
                raise ValueError(f"Quantity must be greater than zero for product {product_id}")

            rate = CurrencyRate.query.filter_by(currency_code=currency).first()
            conversion_rate = Decimal(str(rate.rate if rate else 1))

            product_price = Decimal(str(product.price or 0)) * conversion_rate
            item_total = product_price * Decimal(quantity)
            subtotal += item_total

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                price=product_price,
                line_total=item_total,
                custom_json=item.get("custom_json")
            )
            db.session.add(order_item)

        minimum_order = Decimal(str(area.min_order_value or 0))
        if subtotal < minimum_order:
            decimals = 3 if currency == "KWD" else 2
            raise ValueError(
                f"Minimum order value for {area.name} is {currency} "
                f"{float(minimum_order):.{decimals}f}"
            )

        delivery_charge = Decimal(str(area.delivery_charge or 0))

        # ── Step 5: automatic agent discount (overrides any client value) ──
        discount_percent = Decimal(str(agent.default_discount or 0))
        discount_amount = (subtotal * discount_percent / Decimal("100")).quantize(Decimal("0.01"))

        grand_total = subtotal + delivery_charge - discount_amount
        if grand_total < 0:
            grand_total = Decimal("0.00")

        order.subtotal = subtotal
        order.delivery_charge = delivery_charge
        order.discount = discount_amount
        order.grand_total = grand_total
        order.total = grand_total

        log_order_status(
            order, None, "PENDING", agent.id,
            f"Order created by agent {agent.first_name} {agent.last_name} "
            f"(auto discount {discount_percent}%)"
        )

        db.session.commit()

    except ValueError as error:
        db.session.rollback()
        return jsonify({"error": str(error)}), 400

    except Exception as error:
        db.session.rollback()
        print("Agent create order error:", str(error))
        return jsonify({"error": "Unable to create order"}), 500

    return jsonify({
        "message": "Order created successfully",
        "order": order.to_dict()
    }), 201

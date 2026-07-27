from extensions import db
from datetime import datetime


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(
        db.Integer,
        primary_key=True, autoincrement=True)

    order_id = db.Column(
        db.Integer,
        db.ForeignKey("orders.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    quantity = db.Column(
        db.Integer,
        nullable=False,
        default=1
    )

    price = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    
    line_total = db.Column(
        db.Numeric(10, 2),
        nullable=True
    )

    
    custom_json = db.Column(
        db.JSON,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


    
    order = db.relationship(
        "Order",
        back_populates="items"
    )

    product = db.relationship(
        "Product",
        lazy="joined"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,

            "product": {
                "id": self.product.id,
                "name": self.product.name,
                "description": self.product.description,
                "image_url": self.product.image_url,
                "price": float(self.product.price)
            } if self.product else None,

            "quantity": self.quantity,
            "price": float(self.price),

            "line_total": (
                float(self.line_total)
                if self.line_total is not None
                else float(self.price) * self.quantity
            ),

            "custom_json": self.custom_json,

            "created_at": (
                self.created_at.isoformat()
                if self.created_at else None
            ),

            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at else None
            )
        }
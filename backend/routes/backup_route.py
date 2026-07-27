from flask import Blueprint, jsonify, request, send_from_directory
from flask_jwt_extended import jwt_required

from services.backup_service import (
    create_backup,
    list_backups,
    delete_backup,
    restore_backup,
    BACKUP_DIR
)
import os

from middleware.role import role_required

backup_bp = Blueprint("backup", __name__)


@backup_bp.route("/admin/backup", methods=["POST"])
@jwt_required()
@role_required(["ADMIN"])
def backup_database():

    result = create_backup()

    if result["success"]:
        return jsonify(result), 200

    return jsonify(result), 500


@backup_bp.route("/admin/backups", methods=["GET"])
@jwt_required()
@role_required(["ADMIN"])
def get_backups():

    return jsonify(list_backups()), 200




@backup_bp.route("/admin/backup/download/<filename>", methods=["GET"])
@jwt_required()
@role_required(["ADMIN"])
def download_backup(filename):

    return send_from_directory(
        BACKUP_DIR,
        filename,
        as_attachment=True
    )

@backup_bp.route("/admin/backup/<filename>", methods=["DELETE"])
@jwt_required()
@role_required(["ADMIN"])
def remove_backup(filename):

    result = delete_backup(filename)

    if result["success"]:
        return jsonify(result), 200

    return jsonify(result), 404


@backup_bp.route("/admin/restore", methods=["POST"])
@jwt_required()
@role_required(["OWNER", "ADMIN"])
def restore_database():

    print("==== RESTORE API CALLED ====")

    file = request.files.get("file")

    print("Files:", request.files)
    print("File:", file)

    if not file:
        return jsonify({
            "success": False,
            "message": "Backup file is required."
        }), 400

    filename = file.filename
    file.save(os.path.join(BACKUP_DIR, filename))

    print("Saved:", filename)

    result = restore_backup(filename)

    return jsonify(result), 200 if result["success"] else 500
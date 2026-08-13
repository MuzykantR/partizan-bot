# ==============================================================================
# PARTIZAN VPN — SERVER-SIDE MAKEFILE (EXECUTED DIRECTLY ON SERVER)
# ==============================================================================

.PHONY: help install build deploy deploy-backend deploy-frontend restart logs status clean-db

PROJECT_DIR := /opt/partizan-vpn-bot
WWW_DIR := /var/www/axisforge.tech/twa
SERVICE_NAME := partizan-bot
VENV_PIP := $(PROJECT_DIR)/venv/bin/pip
SUDO := echo 'S@S#0kHZS%smXkaW' | sudo -S

help:
	@echo "PARTIZAN VPN Server-Side Makefile Commands:"
	@echo "  make deploy          - Git pull, build TWA frontend on server, sync Nginx & restart service"
	@echo "  make build           - Build TWA frontend bundle on server & sync to /var/www/axisforge.tech/twa/"
	@echo "  make deploy-backend  - Git pull & restart partizan-bot service"
	@echo "  make restart         - Restart partizan-bot systemd service"
	@echo "  make logs            - Stream systemd service journal logs (50 lines)"
	@echo "  make status          - Check systemd service status"
	@echo "  make install         - Install Python & Node.js dependencies on server"
	@echo "  make clean-db        - Clean partizan_% users from Marzban & reset bot DB"

install:
	@echo "Installing Python dependencies..."
	if [ -f requirements.txt ]; then $(VENV_PIP) install -r requirements.txt; fi
	@echo "Installing Frontend dependencies..."
	npm install

build:
	@echo "Building TWA frontend on server..."
	npm run build
	@echo "Deploying dist to Nginx web root..."
	$(SUDO) cp -r dist/* $(WWW_DIR)/
	$(SUDO) chown -R www-data:www-data $(WWW_DIR)/
	@echo "Frontend deployment complete!"

deploy-backend:
	@echo "Pulling latest code from GitHub..."
	git pull origin main
	@echo "Restarting $(SERVICE_NAME) service..."
	$(SUDO) systemctl restart $(SERVICE_NAME)
	@echo "Backend deployment complete!"

deploy: deploy-backend build
	@echo "✅ Server-side full deployment finished successfully!"

restart:
	$(SUDO) systemctl restart $(SERVICE_NAME)

logs:
	$(SUDO) journalctl -u $(SERVICE_NAME) -n 50 --no-pager

status:
	$(SUDO) systemctl status $(SERVICE_NAME)

clean-db:
	$(SUDO) python3 -c "import sqlite3; conn = sqlite3.connect('/var/lib/marzban/db.sqlite3'); cur = conn.cursor(); cur.execute(\"DELETE FROM users WHERE username LIKE 'partizan_%'\"); conn.commit(); print('Deleted partizan users:', cur.rowcount); conn.close()"
	$(SUDO) rm -f $(PROJECT_DIR)/bot/partizan.db
	$(SUDO) systemctl restart $(SERVICE_NAME)

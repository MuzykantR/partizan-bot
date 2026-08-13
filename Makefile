# ==============================================================================
# PARTIZAN VPN — MAKEFILE & AUTOMATION RUNBOOK
# ==============================================================================

.PHONY: help build check push deploy deploy-backend deploy-frontend logs status clean-db dev

SERVER_ALIAS := axisforge
SERVER_PASS := S@S#0kHZS%smXkaW
SERVER_DIR := /opt/partizan-vpn-bot
WWW_DIR := /var/www/axisforge.tech/twa
SERVICE_NAME := partizan-bot

help:
	@echo "PARTIZAN VPN Makefile Commands:"
	@echo "  make dev             - Start local Vite development server"
	@echo "  make build           - Build local TWA frontend bundle"
	@echo "  make check           - Check Python & TypeScript compilation"
	@echo "  make push MSG='...'  - Commit and push changes to GitHub main"
	@echo "  make deploy-backend  - Git pull & restart partizan-bot on server"
	@echo "  make deploy-frontend - Build & deploy TWA static bundle to Nginx"
	@echo "  make deploy MSG='..' - Complete deploy (push + backend + frontend)"
	@echo "  make logs            - Stream systemd service journal logs"
	@echo "  make status          - Check systemd service status on server"
	@echo "  make clean-db        - Clean test users from Marzban and reset bot DB"

dev:
	npm run dev

build:
	npm run build

check:
	python -m py_compile bot/*.py
	npm run build

push:
	git add .
	@if [ -z "$(MSG)" ]; then \
		git commit -m "update: automated commit"; \
	else \
		git commit -m "$(MSG)"; \
	fi
	git push origin main

deploy-backend:
	ssh $(SERVER_ALIAS) "cd $(SERVER_DIR) && git pull origin main && echo '$(SERVER_PASS)' | sudo -S systemctl restart $(SERVICE_NAME)"

deploy-frontend: build
	scp -r dist $(SERVER_ALIAS):$(SERVER_DIR)/
	ssh $(SERVER_ALIAS) "echo '$(SERVER_PASS)' | sudo -S bash -c 'cp -r $(SERVER_DIR)/dist/* $(WWW_DIR)/ && chown -R www-data:www-data $(WWW_DIR)/'"

deploy: push deploy-backend deploy-frontend
	@echo "✅ Complete deployment finished successfully!"

logs:
	ssh $(SERVER_ALIAS) "echo '$(SERVER_PASS)' | sudo -S journalctl -u $(SERVICE_NAME) -n 50 --no-pager"

status:
	ssh $(SERVER_ALIAS) "echo '$(SERVER_PASS)' | sudo -S systemctl status $(SERVICE_NAME)"

clean-db:
	ssh $(SERVER_ALIAS) "echo 'import sqlite3; conn = sqlite3.connect(\"/var/lib/marzban/db.sqlite3\"); cur = conn.cursor(); cur.execute(\"DELETE FROM users WHERE username LIKE \\\x27partizan_%\\\x27\"); conn.commit(); print(\"Deleted partizan users:\", cur.rowcount); conn.close()' > /tmp/clean.py && echo '$(SERVER_PASS)' | sudo -S python3 /tmp/clean.py && echo '$(SERVER_PASS)' | sudo -S rm -f $(SERVER_DIR)/bot/partizan.db && echo '$(SERVER_PASS)' | sudo -S systemctl restart $(SERVICE_NAME)"

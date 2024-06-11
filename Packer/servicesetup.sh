sudo tee /etc/systemd/system/myservice.service <<EOF
[Unit]
Description=app.js

After=network.target

[Service]
Type=simple
User=csye6225
Group=csye6225
WorkingDirectory=/home/csye6225/webapp
ExecStart=/usr/bin/node /home/csye6225/webapp/app.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload

sleep 10
sudo systemctl enable myservice
sleep 10
sudo systemctl start myservice

sudo chown csye6225:csye6225 /home/csye6225/webapp

sudo usermod -s /sbin/nologin csye6225



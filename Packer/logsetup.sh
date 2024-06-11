sudo curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh

sudo bash add-google-cloud-ops-agent-repo.sh --also-install

CONFIG_CONTENT=$(cat <<EOF
logging:
  receivers:
    my-app-receiver:
      type: files
      include_paths:
        - /var/log/myapp.log
      record_log_file_path: true
  processors:
    my-app-processor:
      type: parse_json
      time_key: time
      time_format: "%Y-%m-%dT%H:%M:%S.%L%Z"
    move_severity:
      type: modify_fields
      fields:
        severity: 
          move_from: jsonPayload.level
  service:
    pipelines:
      default_pipeline:
        receivers: [my-app-receiver]
        processors: 
          - my-app-processor
          - move_severity
EOF
)

# Create the config.yaml file
echo "$CONFIG_CONTENT" | sudo tee /etc/google-cloud-ops-agent/config.yaml > /dev/null

# Create myapp.log file
sudo touch /var/log/myapp.log

# Make myapp.log writable by others
sudo chmod o+w /var/log/myapp.log

sudo systemctl restart myservice
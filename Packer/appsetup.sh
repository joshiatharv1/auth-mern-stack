# Install unzip
sudo yum install -y unzip

# Unzip webapp.zip to /tmp
sudo unzip webapp.zip -d /home/csye6225/webapp


# Install curl (if not already installed)
sudo yum install -y curl
curl –sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

sudo chmod +rx /home/csye6225

# Display current directory after unzip
echo "Current directory after unzip: $(pwd)"

# List files in current directory after unzip
echo "Files in current directory after unzip:"
ls -l

echo "Current directory after trying to reach webapp: $(pwd)"
ls


cd /home/csye6225/webapp
sudo npm install

# Check Node.js version
node --version


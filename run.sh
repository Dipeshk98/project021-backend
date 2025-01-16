# run this command to execute the backend,  for Ubuntu. other OS might be almost same command
#!/bin/bash

# Load nvm (ensure it's available in this script)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# set the node version , not use latest 22 now 
nvm install 20
nvm use 20

# install all the packages
npm install

# start the backend server
npm run dev


#if you are windows then you can also try 4 command manually.
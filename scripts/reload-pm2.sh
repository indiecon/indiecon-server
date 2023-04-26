#!/bin/bash
cd ~/indiecon-server
pm2 stop all
pm2 delete all
npm run prod

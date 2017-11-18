#!/bin/bash
echo "1" > /proc/sys/net/ipv4/ip_forward
echo "ip_forward was setting to 1"

node ./app.js

#echo "argv 1: $1"
#echo "argv 2: $2"

# ping google.com > /dev/null & 
# ping google.com > /dev/null 

# while :
# do
# 	sleep 10
# done

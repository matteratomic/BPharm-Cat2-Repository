NAME=$@

for x in $NAME
do
curl "http://192.168.0.17:1234/api/delete?foldername=$x"
done

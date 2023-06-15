#!/bin/bash

docker rm -f $(docker ps -a -q)
docker volume rm $(docker volume ls -q)
# docker rmi $(docker images -a -q)
rm -rf /home/mjung/data
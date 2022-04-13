#!/bin/sh

apk add openrc
openrc default
apk add redis
rc-update add redis
rc-service redis start
@echo off

echo old versions:
docker image ls parkerbedlan/sloper

echo.
set /p version="What should the next version be? "

docker build -t parkerbedlan/sloper:%version% --build-arg DATABASE_URL=postgres://foo .
docker push parkerbedlan/sloper:%version%

echo paste this into your ssh:
echo "docker pull parkerbedlan/sloper:%version% && dokku git:from-image sloper parkerbedlan/sloper:%version%"

@REM ssh root@68.183.115.8 "docker pull parkerbedlan/sloper:%version% && dokku git:from-image sloper parkerbedlan/sloper:%version%"

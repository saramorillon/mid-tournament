@echo off 

if [%1]==[] (
    echo "Usage: build.cmd <version>"
) else (
    docker build -t saramorillon/mid-tournament .
    docker image tag saramorillon/mid-tournament saramorillon/mid-tournament:%1
    docker push saramorillon/mid-tournament:latest
    docker push saramorillon/mid-tournament:%1
)

FROM ubuntu:latest
LABEL authors="danilkruglov"

ENTRYPOINT ["top", "-b"]
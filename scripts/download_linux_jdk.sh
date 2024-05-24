#!/usr/bin/env bash
# Download a copy of linux JDK in jdks/linux

set -e

# Download linux jdk
mkdir -p jdks/linux
cd jdks/linux
curl https://download.oracle.com/java/17/latest/jdk-17_linux-x64_bin.tar.gz > linux.tar.gz
gunzip -c linux.tar.gz | tar xopf -
rm linux.tar.gz
mv jdk-17.0.11 jdk-17
cd ../..
#!/usr/bin/env bash
# Download a copy of mac JDK in jdks/mac

set -e

# Download mac jdk
mkdir -p jdks/mac
cd jdks/mac
curl https://download.oracle.com/java/17/latest/jdk-17_macos-x64_bin.tar.gz > mac.tar.gz
gunzip -c mac.tar.gz | tar xopf -
rm mac.tar.gz
mv jdk-17.0.11.jdk jdk-17
cd ../..
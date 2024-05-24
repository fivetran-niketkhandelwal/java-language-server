#!/usr/bin/env bash
# Download a copy of windows JDK in jdks/windows

set -e

# Download windows jdk
mkdir -p jdks/windows
cd jdks/windows
curl https://download.oracle.com/java/17/latest/jdk-17_windows-x64_bin.zip > windows.zip
unzip windows.zip
rm windows.zip
mv jdk-17.0.11 jdk-17
cd ../..
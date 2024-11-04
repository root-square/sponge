@echo off
title Sponge Patch Assistant
powershell -NoProfile -ExecutionPolicy Unrestricted -File "./sponge.ps1"

echo Press any key to exit...
pause > nul
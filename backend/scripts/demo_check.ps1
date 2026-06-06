param(
    [string]$Base = "http://127.0.0.1:5000"
)
cd $PSScriptRoot\..
.venv\Scripts\python scripts\demo_check.py $Base
exit $LASTEXITCODE

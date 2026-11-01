[CmdletBinding()]
param(
    [string]$ThemeDirectory = (Join-Path ([Environment]::GetFolderPath('ApplicationData')) 'Typora\themes')
)
$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$sourceFile = Join-Path $projectDirectory 'axiom.css'
if (-not (Test-Path -LiteralPath $sourceFile -PathType Leaf)) { throw "Theme file missing: $sourceFile" }
if (-not (Test-Path -LiteralPath $ThemeDirectory -PathType Container)) {
    throw "Theme directory does not exist. Open Typora Preferences > Appearance > Open Theme Folder, then pass its path with -ThemeDirectory."
}
$resolvedDirectory = (Resolve-Path -LiteralPath $ThemeDirectory).Path
$destinationFile = Join-Path $resolvedDirectory 'axiom.css'
if (Test-Path -LiteralPath $destinationFile -PathType Leaf) {
    $backupFile = "$destinationFile.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss-fff')"
    Copy-Item -LiteralPath $destinationFile -Destination $backupFile
    Write-Output "Backup: $backupFile"
}
Copy-Item -LiteralPath $sourceFile -Destination $destinationFile
Write-Output "Installed: $destinationFile"
Write-Output 'Restart Typora, then select Axiom from the Themes menu.'

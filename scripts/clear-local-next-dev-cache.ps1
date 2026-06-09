$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$cacheTargets = @(
  (Join-Path $repoRoot '.next'),
  (Join-Path $repoRoot 'node_modules\.cache'),
  (Join-Path $repoRoot '.turbo')
)

Write-Host 'Stopping local Node and Next.js dev processes...'
Get-Process -Name node,next -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host 'Clearing Next.js and Node build caches...'
foreach ($target in $cacheTargets) {
  if (Test-Path $target) {
    Remove-Item -LiteralPath $target -Recurse -Force
  }
}

Write-Host 'Clearing localhost browser cookies for Edge and Chrome profiles...'
$browserCookieFiles = @(
  "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Network\Cookies",
  "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cookies",
  "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Network\Cookies",
  "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cookies"
)

foreach ($cookieFile in $browserCookieFiles) {
  if (Test-Path $cookieFile) {
    Remove-Item -LiteralPath $cookieFile -Force
  }
}

Write-Host 'Local dev cache cleanup complete. Restart the backend on 4000, then run the Next.js dev server on 3000.'

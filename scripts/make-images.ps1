# Generates public/og-image.png (1200x630), public/favicon.png (64x64) and public/apple-touch-icon.png (180x180).
# Windows PowerShell 5.1 (System.Drawing). Run from the project root:  powershell -File scripts/make-images.ps1
# Keep this file ASCII-only: PowerShell 5.1 reads scripts using the ANSI code page.
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$pub = Join-Path $root 'public'

$track = [System.Drawing.Color]::FromArgb(45, 91, 208)
$yellow = [System.Drawing.Color]::FromArgb(255, 210, 63)
$navy = [System.Drawing.Color]::FromArgb(22, 34, 74)

function New-RoundRect([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddArc($x, $y, $r * 2, $r * 2, 180, 90)
  $p.AddArc($x + $w - $r * 2, $y, $r * 2, $r * 2, 270, 90)
  $p.AddArc($x + $w - $r * 2, $y + $h - $r * 2, $r * 2, $r * 2, 0, 90)
  $p.AddArc($x, $y + $h - $r * 2, $r * 2, $r * 2, 90, 90)
  $p.CloseFigure()
  return $p
}

# Logo mark on a 64-unit grid (same geometry as src/components/Logo.astro):
# a forward-leaning yellow "S" drawn as a two-lane track on a blue tile, with a white finish line.
function Draw-Logo([System.Drawing.Graphics]$g, [float]$x, [float]$y, [float]$s, [bool]$withTile) {
  $k = $s / 64
  if ($withTile) { $g.FillPath((New-Object System.Drawing.SolidBrush($track)), (New-RoundRect $x $y $s $s (15 * $k))) }
  $saved = $g.Transform
  # SVG: translate(5 0) skewX(-12)  ->  x' = x - tan(12deg) * y + 5
  $m = New-Object System.Drawing.Drawing2D.Matrix(1, 0, -0.21256, 1, 0, 0)
  $g.TranslateTransform($x, $y)
  $g.ScaleTransform($k, $k)
  $g.TranslateTransform(5, 0)
  $g.MultiplyTransform($m)
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddLine([single]47, [single]14.5, [single]27.5, [single]14.5)
  $p.AddArc([single]17.25, [single]14.5, [single]20.5, [single]20.5, [single]270, [single]-180)
  $p.AddLine([single]27.5, [single]35, [single]38.5, [single]35)
  $p.AddArc([single]28.25, [single]35, [single]20.5, [single]20.5, [single]270, [single]180)
  $p.AddLine([single]38.5, [single]55.5, [single]14, [single]55.5)
  $thick = New-Object System.Drawing.Pen($yellow, 13)
  $thick.LineJoin = 'Round'
  $g.DrawPath($thick, $p)
  $g.DrawPath((New-Object System.Drawing.Pen($track, 1.8)), $p)
  $g.DrawLine((New-Object System.Drawing.Pen([System.Drawing.Color]::White, 3)), [single]47.5, [single]7.5, [single]47.5, [single]21.5)
  $g.Transform = $saved
}

function Save-Icon([int]$size, [string]$name) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::Transparent)
  Draw-Logo $g 0 0 $size $true
  $bmp.Save((Join-Path $pub $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
Save-Icon 64 'favicon.png'
Save-Icon 180 'apple-touch-icon.png'

# Social image: the blue track with lanes, the tagline, and the yellow start line.
$W = 1200; $H = 630
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAliasGridFit'
$g.Clear($track)
$white = [System.Drawing.Brushes]::White
$lanePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(225, 255, 255, 255), 3)
$laneH = 76
$top = $H - $laneH * 3
for ($i = 0; $i -le 3; $i++) { $g.DrawLine($lanePen, 0, ($top + $i * $laneH), $W, ($top + $i * $laneH)) }
$g.FillRectangle($white, 150, $top, 8, ($laneH * 3))
$numFont = New-Object System.Drawing.Font('Bahnschrift', 56, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = 'Center'; $sf.LineAlignment = 'Center'
$names = @('TYPING SPEED', 'REACTION TIME', 'MEMORY TRAINING', 'MENTAL MATH')
$nameFont = New-Object System.Drawing.Font('Bahnschrift SemiBold Condensed', 44, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
for ($i = 0; $i -lt 3; $i++) {
  $rect = New-Object System.Drawing.RectangleF(0, ($top + $i * $laneH), 150, $laneH)
  $g.DrawString(([string]($i + 1)), $numFont, $white, $rect, $sf)
  $g.DrawString($names[$i], $nameFont, $white, 190, ($top + $i * $laneH + 14))
}
# Heading block above the track
$g.FillPath((New-Object System.Drawing.SolidBrush($navy)), (New-RoundRect 60 40 72 72 14))
Draw-Logo $g 64 44 64 $true
$brand = New-Object System.Drawing.Font('Bahnschrift SemiBold Condensed', 54, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('SkillSprint', $brand, $white, 150, 46)
$title = New-Object System.Drawing.Font('Bahnschrift', 62, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$titleCond = New-Object System.Drawing.Font('Bahnschrift Condensed', 88, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
if ($titleCond.Name -ne 'Bahnschrift Condensed') { $titleCond = $title }
$g.DrawString('TRAIN YOUR MIND.', $titleCond, $white, 58, 128)
$g.DrawString('CHALLENGE YOUR LIMITS.', $titleCond, $white, 58, 214)
$g.FillRectangle((New-Object System.Drawing.SolidBrush($yellow)), 64, 322, 120, 10)
$bmp.Save((Join-Path $pub 'og-image.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output 'Images written.'

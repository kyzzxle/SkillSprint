# Generates public/og-image.png (1200x630), public/favicon.png (64x64) and public/apple-touch-icon.png (180x180).
# Windows PowerShell 5.1 (System.Drawing). Run from the project root:  powershell -File scripts/make-images.ps1
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$pub = Join-Path $root 'public'

function New-Logo([System.Drawing.Graphics]$g, [float]$x, [float]$y, [float]$s) {
  $rect = New-Object System.Drawing.RectangleF($x, $y, $s, $s)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(124, 77, 255), [System.Drawing.Color]::FromArgb(20, 184, 166), 45)
  $r = $s * 0.28
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($x, $y, $r * 2, $r * 2, 180, 90)
  $path.AddArc($x + $s - $r * 2, $y, $r * 2, $r * 2, 270, 90)
  $path.AddArc($x + $s - $r * 2, $y + $s - $r * 2, $r * 2, $r * 2, 0, 90)
  $path.AddArc($x, $y + $s - $r * 2, $r * 2, $r * 2, 90, 90)
  $path.CloseFigure()
  $g.FillPath($brush, $path)
  # Lightning bolt (same geometry as favicon.svg, 32-unit grid)
  $k = $s / 32
  $pts = @(
    (New-Object System.Drawing.PointF(($x + 18.5 * $k), ($y + 5 * $k))),
    (New-Object System.Drawing.PointF(($x + 9 * $k), ($y + 18 * $k))),
    (New-Object System.Drawing.PointF(($x + 15.5 * $k), ($y + 18 * $k))),
    (New-Object System.Drawing.PointF(($x + 13.5 * $k), ($y + 27 * $k))),
    (New-Object System.Drawing.PointF(($x + 23 * $k), ($y + 14 * $k))),
    (New-Object System.Drawing.PointF(($x + 16.5 * $k), ($y + 14 * $k)))
  )
  $g.FillPolygon([System.Drawing.Brushes]::White, $pts)
}

function Save-Icon([int]$size, [string]$name) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::Transparent)
  New-Logo $g 0 0 $size
  $bmp.Save((Join-Path $pub $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

Save-Icon 64 'favicon.png'
Save-Icon 180 'apple-touch-icon.png'

# Social sharing image
$W = 1200; $H = 630
$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAliasGridFit'
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Rectangle(0, 0, $W, $H)), [System.Drawing.Color]::FromArgb(10, 15, 36), [System.Drawing.Color]::FromArgb(28, 22, 72), 30)
$g.FillRectangle($bg, 0, 0, $W, $H)
$glow = New-Object System.Drawing.Drawing2D.GraphicsPath
$glow.AddEllipse(700, -250, 700, 700)
$pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush($glow)
$pgb.CenterColor = [System.Drawing.Color]::FromArgb(90, 47, 211, 192)
$pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 47, 211, 192))
$g.FillPath($pgb, $glow)

New-Logo $g 80 90 110
$white = [System.Drawing.Brushes]::White
$fontBrand = New-Object System.Drawing.Font('Segoe UI', 54, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('SkillSprint', $fontBrand, $white, 215, 108)
$fontTitle = New-Object System.Drawing.Font('Segoe UI', 76, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('Train Your Mind.', $fontTitle, $white, 72, 250)
$teal = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(47, 211, 192))
$g.DrawString('Challenge Your Limits.', $fontTitle, $teal, 72, 345)
$fontSub = New-Object System.Drawing.Font('Segoe UI', 30, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(195, 201, 230))
# Separators built from char codes so the script stays ASCII-only (PowerShell 5.1 reads scripts as ANSI).
$dot = ' ' + [char]0x00B7 + ' '
$dash = '  ' + [char]0x2014 + '  '
$g.DrawString(('Typing', 'Reaction', 'Memory', 'Math', 'Vocabulary', 'Geography' -join $dot), $fontSub, $muted, 80, 480)
$g.DrawString((('Shortcuts', 'Logic', 'Color', 'Reading' -join $dot) + $dash + 'free, no sign-up'), $fontSub, $muted, 80, 525)
$bmp.Save((Join-Path $pub 'og-image.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output 'Images written.'

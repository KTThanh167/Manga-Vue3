$ErrorActionPreference = 'Stop'

$root = 'C:\Users\thanh\DATN\my-manga-app'
$assets = Join-Path $root 'generated_presentation_assets'
$outFile = Join-Path $root 'Manga-Real-thuyet-trinh-do-an.pptx'
$work = Join-Path $root 'generated_presentation_work'

if (Test-Path $work) { Remove-Item -LiteralPath $work -Recurse -Force }
New-Item -ItemType Directory -Force -Path $work | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work '_rels') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work 'docProps') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work 'ppt') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work 'ppt\_rels') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work 'ppt\slides') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work 'ppt\slides\_rels') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work 'ppt\media') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work 'ppt\theme') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work 'ppt\slideMasters') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work 'ppt\slideMasters\_rels') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work 'ppt\slideLayouts') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $work 'ppt\slideLayouts\_rels') | Out-Null

function Write-Utf8NoBom($path, $content) {
  $enc = [System.Text.UTF8Encoding]::new($false)
  [System.IO.File]::WriteAllText($path, $content, $enc)
}

function X($s) {
  if ($null -eq $s) { return '' }
  return [System.Security.SecurityElement]::Escape([string]$s)
}

function Emu($inch) { [int64]([double]$inch * 914400) }

$script:shapeId = 10
function Next-ShapeId {
  $script:shapeId += 1
  return $script:shapeId
}

function Text-Shape($x, $y, $w, $h, $paragraphs, $fontSize = 24, $color = '1E293B', $bold = $false, $fill = $null, $align = 'l') {
  $id = Next-ShapeId
  $fillXml = if ($fill) { "<a:solidFill><a:srgbClr val=`"$fill`"/></a:solidFill>" } else { '<a:noFill/>' }
  $pXml = ''
  foreach ($p in $paragraphs) {
    $text = if ($p -is [hashtable]) { $p.Text } else { [string]$p }
    $bullet = ($p -is [hashtable]) -and $p.Bullet
    $size = if (($p -is [hashtable]) -and $p.Size) { $p.Size } else { $fontSize }
    $runColor = if (($p -is [hashtable]) -and $p.Color) { $p.Color } else { $color }
    $isBold = if (($p -is [hashtable]) -and $p.ContainsKey('Bold')) { $p.Bold } else { $bold }
    $mar = if ($bullet) { ' marL="285750" indent="-171450"' } else { '' }
    $bu = if ($bullet) { '<a:buChar char="•"/>' } else { '<a:buNone/>' }
    $b = if ($isBold) { ' b="1"' } else { '' }
    $pXml += "<a:p><a:pPr algn=`"$align`"$mar>$bu</a:pPr><a:r><a:rPr lang=`"vi-VN`" sz=`"$($size * 100)`"$b><a:solidFill><a:srgbClr val=`"$runColor`"/></a:solidFill><a:latin typeface=`"Aptos`"/><a:cs typeface=`"Aptos`"/></a:rPr><a:t>$(X $text)</a:t></a:r><a:endParaRPr lang=`"vi-VN`" sz=`"$($size * 100)`"/></a:p>"
  }
  return @"
<p:sp>
  <p:nvSpPr><p:cNvPr id="$id" name="Text $id"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
  <p:spPr><a:xfrm><a:off x="$(Emu $x)" y="$(Emu $y)"/><a:ext cx="$(Emu $w)" cy="$(Emu $h)"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>$fillXml<a:ln><a:noFill/></a:ln></p:spPr>
  <p:txBody><a:bodyPr wrap="square" anchor="t" lIns="91440" tIns="45720" rIns="91440" bIns="45720"/><a:lstStyle/>$pXml</p:txBody>
</p:sp>
"@
}

function Image-Pic($path, $relId, $x, $y, $w, $h) {
  $id = Next-ShapeId
  return @"
<p:pic>
  <p:nvPicPr><p:cNvPr id="$id" name="$(X ([System.IO.Path]::GetFileName($path)))"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>
  <p:blipFill><a:blip r:embed="$relId"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
  <p:spPr><a:xfrm><a:off x="$(Emu $x)" y="$(Emu $y)"/><a:ext cx="$(Emu $w)" cy="$(Emu $h)"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:ln><a:solidFill><a:srgbClr val="D8DEE9"/></a:solidFill></a:ln></p:spPr>
</p:pic>
"@
}

$slides = @(
  @{
    Title='Xây dựng website đọc truyện tranh online Manga Real'
    Subtitle='Đồ án tốt nghiệp - Khuất Tiến Thành - CNTT4 K15'
    Bullets=@('GVHD: TS. Lê Hoàng Anh', 'Đại học Phenikaa - Năm 2026', 'Vue 3, Supabase, AI Chatbox, Global Chat')
    Image='image1.jpeg'
  },
  @{
    Title='Bối cảnh và vấn đề'
    Bullets=@(
      'Nhu cầu đọc truyện tranh trực tuyến tăng mạnh trên thiết bị di động.',
      'Nhiều nền tảng hiện có còn bị gián đoạn bởi quảng cáo, tốc độ tải và trải nghiệm chưa tối ưu.',
      'Thiếu tương tác cộng đồng và thiếu cơ chế gợi ý cá nhân hóa thông minh.',
      'Người dùng dễ rời bỏ khi phải tự tìm kiếm giữa kho truyện quá lớn.'
    )
  },
  @{
    Title='Mục tiêu đề tài'
    Bullets=@(
      'Xây dựng nền tảng Manga Real ổn định, responsive và dễ mở rộng.',
      'Hỗ trợ đọc truyện, tìm kiếm, theo dõi, lịch sử đọc và đọc tiếp chương gần nhất.',
      'Tạo không gian tương tác qua Global Chat thời gian thực.',
      'Tích hợp AI Chatbox và đề xuất truyện theo sở thích người dùng.',
      'Cung cấp khu vực quản trị để quản lý người dùng, truyện và chương nội bộ.'
    )
  },
  @{
    Title='Đối tượng sử dụng và phạm vi'
    Bullets=@(
      'Khách xem: tìm kiếm, xem chi tiết và đọc truyện công khai.',
      'Người dùng: đăng nhập, theo dõi truyện, lưu lịch sử, dùng chat và AI.',
      'Tác giả/người dùng sáng tác: đăng tải truyện nội bộ.',
      'Quản trị viên: quản lý tài khoản, kiểm duyệt nội dung, quản lý truyện và chương.',
      'Phạm vi tập trung vào website, phù hợp cộng đồng đọc truyện quy mô vừa.'
    )
    Image='image4.png'
  },
  @{
    Title='Kiến trúc tổng quan'
    Bullets=@(
      'Frontend SPA xây dựng bằng Vue 3, Vue Router và Pinia.',
      'Supabase đảm nhiệm xác thực, PostgreSQL, Storage và Realtime.',
      'OTruyen API cung cấp dữ liệu truyện bên ngoài.',
      'Gemini API xử lý phân tích yêu cầu, embedding và sinh phản hồi AI.',
      'Admin route được bảo vệ bằng kiểm tra đăng nhập và vai trò.'
    )
    Image='image10.png'
  },
  @{
    Title='Công nghệ sử dụng'
    Bullets=@(
      'Vue 3 Composition API: xây dựng giao diện theo component.',
      'Vite: môi trường phát triển nhanh và build tối ưu.',
      'Tailwind CSS + Ant Design Vue: giao diện responsive, nhất quán.',
      'Pinia: quản lý trạng thái auth, home, manga.',
      'Supabase: Auth, PostgreSQL, Realtime, Row Level Security.',
      'Gemini API: AI Chatbox, vector embedding và gợi ý truyện.'
    )
  },
  @{
    Title='Nhóm chức năng người dùng'
    Bullets=@(
      'Trang chủ hiển thị truyện mới cập nhật và danh sách đề xuất.',
      'Tìm kiếm theo từ khóa, lọc theo thể loại và phân trang.',
      'Trang chi tiết truyện hiển thị mô tả, ảnh bìa, danh sách chương.',
      'Trình đọc truyện tải ảnh chương, điều hướng chương và lưu lịch sử.',
      'Theo dõi truyện yêu thích, đồng bộ qua Supabase hoặc LocalStorage.'
    )
    Image='image26.png'
  },
  @{
    Title='Giao diện tìm kiếm và chi tiết truyện'
    Bullets=@(
      'SearchView kết hợp URL query, store và OTruyen API.',
      'Kết quả được sắp xếp theo thời gian cập nhật mới nhất.',
      'MangaDetailView cho phép đọc tiếp, theo dõi và xem danh sách chương.',
      'Thiết kế tối ưu để thao tác nhanh trên desktop và mobile.'
    )
    Image='image27.png'
  },
  @{
    Title='AI Chatbox tư vấn truyện'
    Bullets=@(
      'Người dùng nhập yêu cầu tự nhiên như thể loại, nội dung, số chương.',
      'Gemini phân tích câu hỏi thành JSON: từ khóa, thể loại, số chương tối thiểu.',
      'Gemini Embedding tạo vector truy vấn 768 chiều.',
      'Supabase RPC match_mangas_ai tìm truyện tương đồng bằng Vector Search.',
      'AI tổng hợp phản hồi ngắn và hiển thị thẻ truyện gợi ý.'
    )
    Image='image6.png'
  },
  @{
    Title='Đề xuất truyện cá nhân hóa'
    Bullets=@(
      'Hệ thống lấy lịch sử đọc gần nhất của người dùng từ reading_history.',
      'Thống kê thể loại xuất hiện nhiều nhất trong lịch sử đọc.',
      'Gọi OTruyen API theo thể loại yêu thích qua nhiều trang dữ liệu.',
      'Lọc truyện hợp lệ, ưu tiên truyện mới và chương mới nhất.',
      'Nếu chưa có lịch sử, hệ thống fallback về danh sách truyện mới.'
    )
    Image='image9.png'
  },
  @{
    Title='Global Chat thời gian thực'
    Bullets=@(
      'Client subscribe kênh Supabase Realtime qua WebSocket.',
      'Tin nhắn mới được ghi vào bảng dữ liệu và broadcast tới các client đang online.',
      'Giao diện cập nhật state và hiển thị tin nhắn không cần tải lại trang.',
      'Presence được dùng để theo dõi số người đang trực tuyến.'
    )
    Image='image8.png'
  },
  @{
    Title='Quản trị hệ thống'
    Bullets=@(
      'Admin Dashboard được bảo vệ bằng Supabase Auth và role trong bảng profiles.',
      'Quản lý người dùng: tìm kiếm, thêm thủ công, đổi vai trò, khóa/mở tài khoản.',
      'Quản lý truyện và chương nội bộ: thêm, sửa, xóa, upload ảnh bìa/nội dung.',
      'Row Level Security giới hạn thao tác quản trị cho tài khoản admin.'
    )
    Image='image30.png'
  },
  @{
    Title='Cơ sở dữ liệu và bảo mật'
    Bullets=@(
      'profiles: thông tin người dùng và phân quyền user/admin.',
      'custom_users, custom_mangas, custom_chapters: dữ liệu nội bộ do hệ thống quản lý.',
      'bookmarks và reading_history: theo dõi, lịch sử đọc và dữ liệu cá nhân hóa.',
      'Supabase Auth không lưu mật khẩu trực tiếp trong ứng dụng.',
      'RLS policy kiểm soát quyền xem, thêm, sửa, xóa theo vai trò.'
    )
    Image='image22.png'
  },
  @{
    Title='Kiểm thử và kết quả'
    Bullets=@(
      'Kiểm thử giao diện trên các màn hình chính: đăng nhập, trang chủ, tìm kiếm, chi tiết, đọc truyện.',
      'Kiểm thử dữ liệu với Supabase Auth, lưu lịch sử, bookmark và quyền admin.',
      'Hệ thống đáp ứng các chức năng cốt lõi: đọc truyện, tìm kiếm, AI, realtime chat, quản trị.',
      'Sản phẩm có khả năng triển khai thực tế cho cộng đồng đọc truyện quy mô vừa.'
    )
    Image='image31.png'
  },
  @{
    Title='Hạn chế và hướng phát triển'
    Bullets=@(
      'Phụ thuộc vào API bên ngoài nên cần cơ chế cache và dự phòng tốt hơn.',
      'AI Chatbox còn phụ thuộc quota/API key, cần tối ưu chi phí và tốc độ phản hồi.',
      'Mở rộng PWA/mobile app để cải thiện trải nghiệm đọc trên điện thoại.',
      'Bổ sung hệ thống thanh toán/ủng hộ tác giả và kiểm duyệt nội dung nâng cao.',
      'Nâng cấp mô hình gợi ý bằng dữ liệu hành vi sâu hơn và đánh giá người dùng.'
    )
  },
  @{
    Title='Kết luận'
    Bullets=@(
      'Manga Real hoàn thiện nền tảng đọc truyện trực tuyến với trải nghiệm người dùng hiện đại.',
      'Hệ thống kết hợp đọc truyện, cộng đồng, quản trị và AI trong cùng một sản phẩm.',
      'Kiến trúc Vue 3 + Supabase giúp triển khai nhanh, bảo mật và dễ mở rộng.',
      'Đồ án có giá trị thực tiễn và có thể tiếp tục phát triển thành nền tảng nội dung số lớn hơn.'
    )
    Image='image28.png'
  }
)

$mediaMap = @{}
$mediaIndex = 1
foreach ($s in $slides) {
  if ($s.Image -and -not $mediaMap.ContainsKey($s.Image)) {
    $src = Join-Path $assets $s.Image
    $ext = [System.IO.Path]::GetExtension($src).ToLowerInvariant()
    $destName = "image$mediaIndex$ext"
    Copy-Item -LiteralPath $src -Destination (Join-Path $work "ppt\media\$destName")
    $mediaMap[$s.Image] = $destName
    $mediaIndex += 1
  }
}

for ($i = 0; $i -lt $slides.Count; $i++) {
  $s = $slides[$i]
  $script:shapeId = 10
  $elements = ''
  $elements += Text-Shape 0.35 0.25 12.6 0.75 @(@{Text=$s.Title; Size=28; Bold=$true; Color='0F172A'}) 28 '0F172A' $true
  if ($s.Subtitle) {
    $elements += Text-Shape 0.55 1.05 6.6 1.0 @(@{Text=$s.Subtitle; Size=18; Color='475569'}) 18 '475569'
  }
  if ($s.Image) {
    $imgRel = 'rId1'
    $imgTarget = "../media/$($mediaMap[$s.Image])"
    $elements += Image-Pic $s.Image $imgRel 7.15 1.25 5.55 4.95
    $relXml = "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><Relationships xmlns=`"http://schemas.openxmlformats.org/package/2006/relationships`"><Relationship Id=`"$imgRel`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image`" Target=`"$imgTarget`"/></Relationships>"
  } else {
    $relXml = "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><Relationships xmlns=`"http://schemas.openxmlformats.org/package/2006/relationships`"/>"
  }
  $bulletX = if ($s.Image) { 0.55 } else { 1.15 }
  $bulletW = if ($s.Image) { 6.35 } else { 11.0 }
  $bulletY = if ($s.Subtitle) { 2.0 } else { 1.35 }
  $bulletParas = @()
  foreach ($b in $s.Bullets) { $bulletParas += @{Text=$b; Bullet=$true; Size=19; Color='1E293B'} }
  $elements += Text-Shape $bulletX $bulletY $bulletW 5.25 $bulletParas 19 '1E293B'
  $elements += Text-Shape 0.45 6.92 12.45 0.35 @(@{Text="Manga Real | Đồ án tốt nghiệp | Khuất Tiến Thành"; Size=9; Color='64748B'}) 9 '64748B'
  $slideXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="F8FAFC"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      $elements
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>
"@
  Write-Utf8NoBom (Join-Path $work "ppt\slides\slide$($i+1).xml") $slideXml
  Write-Utf8NoBom (Join-Path $work "ppt\slides\_rels\slide$($i+1).xml.rels") $relXml
}

$slideIds = ''
$presRels = '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/><Relationship Id="rIdTheme" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>'
for ($i = 1; $i -le $slides.Count; $i++) {
  $id = 255 + $i
  $rid = "rId$($i + 1)"
  $slideIds += "<p:sldId id=`"$id`" r:id=`"$rid`"/>"
  $presRels += "<Relationship Id=`"$rid`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide`" Target=`"slides/slide$i.xml`"/>"
}

$presentationXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" saveSubsetFonts="1">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>$slideIds</p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:defaultTextStyle><a:defPPr><a:defRPr lang="vi-VN"/></a:defPPr></p:defaultTextStyle>
</p:presentation>
"@
Write-Utf8NoBom (Join-Path $work 'ppt\presentation.xml') $presentationXml
Write-Utf8NoBom (Join-Path $work 'ppt\_rels\presentation.xml.rels') "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><Relationships xmlns=`"http://schemas.openxmlformats.org/package/2006/relationships`">$presRels</Relationships>"

$masterXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
  <p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>
"@
Write-Utf8NoBom (Join-Path $work 'ppt\slideMasters\slideMaster1.xml') $masterXml
Write-Utf8NoBom (Join-Path $work 'ppt\slideMasters\_rels\slideMaster1.xml.rels') "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><Relationships xmlns=`"http://schemas.openxmlformats.org/package/2006/relationships`"><Relationship Id=`"rId1`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout`" Target=`"../slideLayouts/slideLayout1.xml`"/><Relationship Id=`"rId2`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme`" Target=`"../theme/theme1.xml`"/></Relationships>"
Write-Utf8NoBom (Join-Path $work 'ppt\slideLayouts\slideLayout1.xml') "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><p:sldLayout xmlns:a=`"http://schemas.openxmlformats.org/drawingml/2006/main`" xmlns:r=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships`" xmlns:p=`"http://schemas.openxmlformats.org/presentationml/2006/main`" type=`"blank`" preserve=`"1`"><p:cSld name=`"Blank`"><p:spTree><p:nvGrpSpPr><p:cNvPr id=`"1`" name=`"`"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x=`"0`" y=`"0`"/><a:ext cx=`"0`" cy=`"0`"/><a:chOff x=`"0`" y=`"0`"/><a:chExt cx=`"0`" cy=`"0`"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>"
Write-Utf8NoBom (Join-Path $work 'ppt\slideLayouts\_rels\slideLayout1.xml.rels') "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><Relationships xmlns=`"http://schemas.openxmlformats.org/package/2006/relationships`"><Relationship Id=`"rId1`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster`" Target=`"../slideMasters/slideMaster1.xml`"/></Relationships>"

$themeXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Manga Real">
  <a:themeElements>
    <a:clrScheme name="MangaReal"><a:dk1><a:srgbClr val="0F172A"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1E293B"/></a:dk2><a:lt2><a:srgbClr val="F8FAFC"/></a:lt2><a:accent1><a:srgbClr val="7C3AED"/></a:accent1><a:accent2><a:srgbClr val="2563EB"/></a:accent2><a:accent3><a:srgbClr val="14B8A6"/></a:accent3><a:accent4><a:srgbClr val="F97316"/></a:accent4><a:accent5><a:srgbClr val="64748B"/></a:accent5><a:accent6><a:srgbClr val="E11D48"/></a:accent6><a:hlink><a:srgbClr val="2563EB"/></a:hlink><a:folHlink><a:srgbClr val="7C3AED"/></a:folHlink></a:clrScheme>
    <a:fontScheme name="Aptos"><a:majorFont><a:latin typeface="Aptos Display"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
  </a:themeElements>
</a:theme>
"@
Write-Utf8NoBom (Join-Path $work 'ppt\theme\theme1.xml') $themeXml

$ct = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
"@
for ($i = 1; $i -le $slides.Count; $i++) {
  $ct += "  <Override PartName=`"/ppt/slides/slide$i.xml`" ContentType=`"application/vnd.openxmlformats-officedocument.presentationml.slide+xml`"/>`n"
}
$ct += '</Types>'
Write-Utf8NoBom (Join-Path $work '[Content_Types].xml') $ct

Write-Utf8NoBom (Join-Path $work '_rels\.rels') "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><Relationships xmlns=`"http://schemas.openxmlformats.org/package/2006/relationships`"><Relationship Id=`"rId1`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument`" Target=`"ppt/presentation.xml`"/><Relationship Id=`"rId2`" Type=`"http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties`" Target=`"docProps/core.xml`"/><Relationship Id=`"rId3`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties`" Target=`"docProps/app.xml`"/></Relationships>"
Write-Utf8NoBom (Join-Path $work 'docProps\core.xml') "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><cp:coreProperties xmlns:cp=`"http://schemas.openxmlformats.org/package/2006/metadata/core-properties`" xmlns:dc=`"http://purl.org/dc/elements/1.1/`" xmlns:dcterms=`"http://purl.org/dc/terms/`" xmlns:dcmitype=`"http://purl.org/dc/dcmitype/`" xmlns:xsi=`"http://www.w3.org/2001/XMLSchema-instance`"><dc:title>Manga Real - Thuyết trình đồ án</dc:title><dc:creator>Khuất Tiến Thành</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy><dcterms:created xsi:type=`"dcterms:W3CDTF`">2026-05-20T00:00:00Z</dcterms:created><dcterms:modified xsi:type=`"dcterms:W3CDTF`">2026-05-20T00:00:00Z</dcterms:modified></cp:coreProperties>"
Write-Utf8NoBom (Join-Path $work 'docProps\app.xml') "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><Properties xmlns=`"http://schemas.openxmlformats.org/officeDocument/2006/extended-properties`" xmlns:vt=`"http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes`"><Application>Microsoft PowerPoint</Application><PresentationFormat>On-screen Show (16:9)</PresentationFormat><Slides>$($slides.Count)</Slides></Properties>"

if (Test-Path $outFile) { Remove-Item -LiteralPath $outFile -Force }
$zipPath = Join-Path $root 'Manga-Real-thuyet-trinh-do-an.zip'
if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Compress-Archive -Path (Join-Path $work '*') -DestinationPath $zipPath -Force
Move-Item -LiteralPath $zipPath -Destination $outFile -Force

Write-Host "Created $outFile"

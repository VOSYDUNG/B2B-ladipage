import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { wlContentPolicy, wlLo, wlVi } from './locales-wl'

const runtimeFiles = [
  new URL('../components/white-lotus/campaign-page.tsx', import.meta.url),
  new URL('../components/white-lotus/product-catalog.tsx', import.meta.url),
  new URL('../components/white-lotus/white-lotus-order-dialog.tsx', import.meta.url),
  new URL('../components/white-lotus/sample-request-dialog.tsx', import.meta.url),
]

test('keeps NNC Pharma as the owning brand of the White Lotus campaign', async () => {
  assert.equal(wlContentPolicy.showNncLogo, true)
  const campaignSource = await readFile(new URL('../components/white-lotus/campaign-page.tsx', import.meta.url), 'utf8')
  assert.match(campaignSource, /\/nnc-logo\.png/)
  assert.match(campaignSource, /NNC PHARMA/)
  assert.match(campaignSource, /White Lotus · New Products/)
})

test('does not render medical claims in the public product catalog', async () => {
  const source = await readFile(new URL('../components/white-lotus/product-catalog.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /\.indications|\.advantages|\.administration|\.dosage/)
  assert.doesNotMatch(source, /ProductDetailModal/)
})

test('removes unsupported sample and response-time promises from public flows', async () => {
  const sources = await Promise.all(runtimeFiles.map(file => readFile(file, 'utf8')))
  for (const source of sources) {
    assert.doesNotMatch(source, /Hoàn toàn miễn phí|Phản hồi 24h|phản hồi trong 24h|ຕອບໄວ 24h|ຕອບພາຍໃນ 24h/)
  }
})

test('uses the locale-owned consent key in the order flow', async () => {
  const source = await readFile(new URL('../components/white-lotus/white-lotus-order-dialog.tsx', import.meta.url), 'utf8')
  assert.match(source, /ui\.form\.consentText/)
  assert.doesNotMatch(source, /ui\.form\.consent['"]/)
})

test('keeps the sample request copy commercial and visually restrained', async () => {
  const source = await readFile(new URL('../components/white-lotus/sample-request-dialog.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /Dùng thử trước khi quyết định|Chi tiết thành phần, liều dùng|Khuyến nghị – nhận đầy đủ/)
  assert.doesNotMatch(source, /[🎁💡⚠️]/u)
  assert.doesNotMatch(source, /bg-gradient/)
  assert.match(source, /Sales kiểm tra điều kiện cấp mẫu/)
  assert.match(source, /Sales gửi tài liệu phù hợp sau khi xác nhận/)
})

test('renders promotion guidance in the order and catalog decision surfaces', async () => {
  const orderSource = await readFile(new URL('../components/white-lotus/white-lotus-order-dialog.tsx', import.meta.url), 'utf8')
  const catalogSource = await readFile(new URL('../components/white-lotus/product-catalog.tsx', import.meta.url), 'utf8')
  assert.match(orderSource, /PromotionTierMatrix/)
  assert.match(catalogSource, /PromotionTierRail/)
})

test('labels the catalog structure as two levels with three thresholds', async () => {
  const source = await readFile(new URL('../components/white-lotus/promotion-tier-matrix.tsx', import.meta.url), 'utf8')
  assert.match(source, /labelVi: 'Mức 1 · mốc 4'/)
  assert.match(source, /labelVi: 'Mức 1 · mốc 6'/)
  assert.match(source, /labelVi: 'Mức 2'/)
  assert.match(source, /useReducedMotion/)
  assert.match(source, /PromotionTierMatrix/)
  assert.match(source, /PromotionTierRail/)
  assert.match(source, /Lotofex 200 · Fexentrix 60\/120/)
  assert.match(source, /Etorilux 120/)
  assert.match(source, /multi-vitamin-level-1\.jpg/)
  assert.match(source, /wl\.promotion\.level_one_reward/)
  assert.match(source, /wl\.promotion\.program_product/)
})

test('keeps Lao promotion keys aligned with the supplied catalog', () => {
  assert.equal(wlLo.promotion.catalog_program_content, 'ເນື້ອໃນໂຄງການ')
  assert.equal(wlLo.promotion.catalog_product_code, 'ລະຫັດສິນຄ້າ')
  assert.equal(wlLo.promotion.catalog_product_name, 'ຊື່ສິນຄ້າ')
  assert.equal(wlLo.promotion.level_one_buy_4, 'ຊື້ 4 ແຖມ 1 Multi Vitamin NC')
  assert.equal(wlLo.promotion.level_one_buy_6, 'ຊື້ 6 ແຖມ 1 Multi Vitamin NC')
  assert.equal(wlLo.promotion.level_two_buy_12, 'ຊື້ 12 ແຖມ 1 ສິນຄ້າປະເພດດຽວກັນ')
  assert.equal(wlLo.promotion.program_product, '1 ສິນຄ້າປະເພດດຽວກັນ')
  assert.equal(wlVi.promotion.program_product, '1 sản phẩm cùng loại')
})

test('uses commercial Lao copy without adding medical promises', () => {
  assert.match(wlLo.hero.badge, /ຂໍ້ສະເໜີພິເສດ/)
  assert.match(wlLo.hero.title_part2, /ໂອກາດການຂາຍ/)
  assert.match(wlLo.hero.description, /ໄລຍະຈຳກັດ/)
  assert.match(wlLo.products.order_cta, /ເລືອກຈຳນວນ/)
  assert.match(wlLo.footer.cta, /Sales ຕິດຕໍ່/)
  assert.doesNotMatch(`${wlLo.hero.subtitle} ${wlLo.highlights.desc1} ${wlLo.products.desc}`, /ຮັກສາ|ປິ່ນປົວ|ຮັບປະກັນ/u)
})

test('keeps large-order consultation separate from promotion thresholds', async () => {
  const source = await readFile(new URL('../components/white-lotus/product-catalog.tsx', import.meta.url), 'utf8')
  assert.match(source, /bulk_order/)
  assert.match(source, /B2B/)
  assert.doesNotMatch(source, /bulk_order[^\n]+buy_quantity|bulk_order[^\n]+gift_quantity/)
})

test('uses direct Firestore Lead intake without Cloud Functions', async () => {
  const source = await readFile(new URL('../lib/lead-service.ts', import.meta.url), 'utf8')

  assert.match(source, /submitLeadToFirestore/)
  assert.match(source, /getAppCheckToken/)
  assert.match(source, /serverTimestamp/)
  assert.match(source, /firestore_web_v1/)
  assert.doesNotMatch(source, /fetch\(getLeadApiUrl|\/api\/leads/)
})

test('keeps the direct Firestore CRM read-only and Lead-only', async () => {
  const [serviceSource, dashboardSource, firebaseConfigSource] = await Promise.all([
    readFile(new URL('../lib/admin-lead-service.ts', import.meta.url), 'utf8'),
    readFile(new URL('../components/B2BCrmDashboard.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../firebase.json', import.meta.url), 'utf8'),
  ])

  assert.match(serviceSource, /collection\(db, 'leads'\)/)
  assert.match(serviceSource, /CRM is read-only in direct Firestore mode/)
  assert.doesNotMatch(serviceSource, /\/api\/admin\/leads|fetch\(/)
  assert.match(dashboardSource, /const canViewAnalytics = false/)
  assert.match(dashboardSource, /const canViewLandingPages = false/)
  assert.match(dashboardSource, /readOnlyMode = true/)
  assert.match(dashboardSource, /Open Analytics/)
  assert.doesNotMatch(firebaseConfigSource, /"function"\s*:/)
})

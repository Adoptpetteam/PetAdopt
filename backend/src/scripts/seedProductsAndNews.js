/**
 * Script seed 30 sản phẩm + 50 bài viết mẫu
 * Chạy: node src/scripts/seedProductsAndNews.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Product = require('../models/Product');

// ─── News schema (inline vì dùng trong routes) ───────────────────────────────
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String },
  image: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
}, { timestamps: true });
const News = mongoose.models.News || mongoose.model('News', newsSchema);

// ─── Ảnh placeholder theo danh mục ───────────────────────────────────────────
const IMG = {
  food: [
    'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
    'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
  ],
  clean: [
    'https://images.unsplash.com/photo-1625794084867-8ddd239946b1?w=400',
    'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400',
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400',
  ],
  toy: [
    'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=400',
    'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=400',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400',
  ],
  news: [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
    'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=600',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600',
    'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=600',
    'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=600',
    'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=600',
    'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600',
  ],
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── 30 sản phẩm mẫu ─────────────────────────────────────────────────────────
const PRODUCTS = [
  // Thức ăn (12 sp)
  { name: 'Thức ăn hạt Royal Canin cho chó nhỏ 1kg', category: 'Thức ăn', price: 185000, quantity: rand(20,100), description: 'Thức ăn hạt cao cấp Royal Canin dành cho chó giống nhỏ dưới 10kg. Giàu protein, vitamin và khoáng chất.', image: pick(IMG.food) },
  { name: 'Pate Whiskas cho mèo vị cá ngừ 85g', category: 'Thức ăn', price: 18000, quantity: rand(50,200), description: 'Pate Whiskas thơm ngon, giàu dinh dưỡng cho mèo mọi lứa tuổi. Vị cá ngừ hấp dẫn.', image: pick(IMG.food) },
  { name: 'Thức ăn hạt Purina Pro Plan cho mèo 1.5kg', category: 'Thức ăn', price: 320000, quantity: rand(15,60), description: 'Hạt Purina Pro Plan giúp mèo phát triển cơ bắp, lông mượt và hệ tiêu hóa khỏe mạnh.', image: pick(IMG.food) },
  { name: 'Snack thưởng Temptations cho mèo 85g', category: 'Thức ăn', price: 45000, quantity: rand(30,150), description: 'Snack giòn tan bên ngoài, mềm bên trong. Mèo cưng sẽ không thể cưỡng lại.', image: pick(IMG.food) },
  { name: 'Thức ăn ướt Pedigree cho chó vị bò 100g', category: 'Thức ăn', price: 22000, quantity: rand(40,180), description: 'Thức ăn ướt Pedigree bổ sung đầy đủ dưỡng chất, phù hợp cho chó mọi giống.', image: pick(IMG.food) },
  { name: 'Hạt Hill\'s Science Diet cho chó trưởng thành 2kg', category: 'Thức ăn', price: 450000, quantity: rand(10,40), description: 'Công thức khoa học giúp duy trì cân nặng lý tưởng và sức khỏe tim mạch cho chó.', image: pick(IMG.food) },
  { name: 'Snack xương gặm Dentastix cho chó vừa', category: 'Thức ăn', price: 65000, quantity: rand(25,80), description: 'Xương gặm giúp làm sạch răng, giảm mảng bám và hơi thở thơm tho cho chó.', image: pick(IMG.food) },
  { name: 'Thức ăn hạt Orijen cho mèo 340g', category: 'Thức ăn', price: 280000, quantity: rand(15,50), description: 'Orijen làm từ 85% nguyên liệu tươi, không chứa ngũ cốc, phù hợp với bản năng ăn thịt của mèo.', image: pick(IMG.food) },
  { name: 'Cá khô sấy cho mèo 50g', category: 'Thức ăn', price: 35000, quantity: rand(60,200), description: 'Cá khô sấy tự nhiên, không chất bảo quản. Nguồn protein tự nhiên tuyệt vời cho mèo.', image: pick(IMG.food) },
  { name: 'Thức ăn hạt Acana Puppy cho chó con 2kg', category: 'Thức ăn', price: 520000, quantity: rand(10,35), description: 'Acana Puppy giàu DHA hỗ trợ phát triển não bộ và thị lực cho chó con.', image: pick(IMG.food) },
  { name: 'Sữa bột Beaphar cho chó mèo con 200g', category: 'Thức ăn', price: 145000, quantity: rand(20,70), description: 'Sữa thay thế sữa mẹ cho chó mèo sơ sinh và mồ côi. Dễ tiêu hóa, đầy đủ dinh dưỡng.', image: pick(IMG.food) },
  { name: 'Bánh thưởng Milk-Bone cho chó 200g', category: 'Thức ăn', price: 55000, quantity: rand(35,120), description: 'Bánh thưởng giòn ngon bổ sung canxi và vitamin cho chó. Phù hợp làm phần thưởng khi huấn luyện.', image: pick(IMG.food) },

  // Vệ sinh & Làm sạch (9 sp)
  { name: 'Dầu gội Bio-Groom cho chó lông dài 355ml', category: 'Vệ sinh & Làm sạch', price: 185000, quantity: rand(20,80), description: 'Dầu gội chuyên dụng làm mềm và bóng lông, phù hợp cho chó lông dài như Poodle, Maltese.', image: pick(IMG.clean) },
  { name: 'Khăn ướt vệ sinh thú cưng 80 tờ', category: 'Vệ sinh & Làm sạch', price: 45000, quantity: rand(50,200), description: 'Khăn ướt không cồn, an toàn cho da nhạy cảm. Tiện lợi lau sạch sau khi đi dạo.', image: pick(IMG.clean) },
  { name: 'Cát vệ sinh cho mèo hương lavender 5L', category: 'Vệ sinh & Làm sạch', price: 95000, quantity: rand(30,100), description: 'Cát vón cục nhanh, khử mùi hiệu quả với hương lavender dịu nhẹ. Ít bụi, an toàn cho mèo.', image: pick(IMG.clean) },
  { name: 'Xịt khử mùi chuồng thú cưng 500ml', category: 'Vệ sinh & Làm sạch', price: 75000, quantity: rand(25,90), description: 'Xịt khử mùi sinh học, an toàn cho thú cưng và người. Hiệu quả lên đến 24 giờ.', image: pick(IMG.clean) },
  { name: 'Bàn chải đánh răng cho chó mèo bộ 3 cái', category: 'Vệ sinh & Làm sạch', price: 35000, quantity: rand(40,150), description: 'Bộ bàn chải đánh răng 3 kích cỡ phù hợp cho mọi giống chó mèo. Giúp ngăn ngừa cao răng.', image: pick(IMG.clean) },
  { name: 'Kem đánh răng thú cưng vị gà 75g', category: 'Vệ sinh & Làm sạch', price: 55000, quantity: rand(30,100), description: 'Kem đánh răng enzyme không cần súc miệng, an toàn khi nuốt. Vị gà thú cưng yêu thích.', image: pick(IMG.clean) },
  { name: 'Lược chải lông FURminator cho mèo lông ngắn', category: 'Vệ sinh & Làm sạch', price: 320000, quantity: rand(10,40), description: 'Lược FURminator giảm đến 90% lông rụng. Thiết kế ergonomic thoải mái khi sử dụng.', image: pick(IMG.clean) },
  { name: 'Tã lót cho chó cái size M 10 cái', category: 'Vệ sinh & Làm sạch', price: 85000, quantity: rand(20,70), description: 'Tã lót siêu thấm hút cho chó cái trong kỳ động dục. Thiết kế ôm sát, không rò rỉ.', image: pick(IMG.clean) },
  { name: 'Dung dịch vệ sinh tai cho chó mèo 118ml', category: 'Vệ sinh & Làm sạch', price: 125000, quantity: rand(20,60), description: 'Dung dịch làm sạch tai nhẹ nhàng, ngăn ngừa viêm tai và mùi hôi. Không gây kích ứng.', image: pick(IMG.clean) },

  // Phụ kiện đồ chơi (9 sp)
  { name: 'Vòng cổ da cho chó size M màu đỏ', category: 'Phụ kiện đồ chơi', price: 85000, quantity: rand(25,80), description: 'Vòng cổ da thật bền đẹp, có khóa điều chỉnh. Phù hợp cho chó cổ 30-40cm.', image: pick(IMG.toy) },
  { name: 'Dây dắt chó tự thu 5m', category: 'Phụ kiện đồ chơi', price: 145000, quantity: rand(20,60), description: 'Dây dắt tự thu tiện lợi, khóa an toàn, tay cầm ergonomic. Phù hợp cho chó dưới 25kg.', image: pick(IMG.toy) },
  { name: 'Chuồng lưới cho mèo 60x45x45cm', category: 'Phụ kiện đồ chơi', price: 450000, quantity: rand(5,20), description: 'Chuồng lưới thông thoáng, dễ vệ sinh. Có khay vệ sinh và cửa mở rộng tiện lợi.', image: pick(IMG.toy) },
  { name: 'Đồ chơi cần câu lông vũ cho mèo', category: 'Phụ kiện đồ chơi', price: 35000, quantity: rand(40,150), description: 'Cần câu lông vũ kích thích bản năng săn mồi của mèo. Giúp mèo vận động và giảm stress.', image: pick(IMG.toy) },
  { name: 'Bóng cao su có chuông cho chó', category: 'Phụ kiện đồ chơi', price: 45000, quantity: rand(35,120), description: 'Bóng cao su tự nhiên bền chắc, có chuông bên trong tạo âm thanh thú vị khi chơi.', image: pick(IMG.toy) },
  { name: 'Nhà ngủ cho mèo hình tròn size L', category: 'Phụ kiện đồ chơi', price: 285000, quantity: rand(10,35), description: 'Nhà ngủ lông mềm mại ấm áp, đế chống trượt. Mèo sẽ yêu thích góc riêng tư này.', image: pick(IMG.toy) },
  { name: 'Bát ăn inox đôi cho chó mèo size M', category: 'Phụ kiện đồ chơi', price: 95000, quantity: rand(30,100), description: 'Bát inox 304 an toàn thực phẩm, không gỉ sét. Đế cao su chống trượt, dễ vệ sinh.', image: pick(IMG.toy) },
  { name: 'Áo len cho chó size S màu xanh', category: 'Phụ kiện đồ chơi', price: 125000, quantity: rand(15,50), description: 'Áo len ấm áp cho chó nhỏ trong mùa đông. Chất liệu mềm mại, không gây kích ứng da.', image: pick(IMG.toy) },
  { name: 'Máy phun nước tự động cho mèo 2L', category: 'Phụ kiện đồ chơi', price: 385000, quantity: rand(8,25), description: 'Máy phun nước tuần hoàn giúp mèo uống đủ nước. Lọc than hoạt tính giữ nước sạch 24/7.', image: pick(IMG.toy) },
];

// ─── 50 bài viết mẫu ─────────────────────────────────────────────────────────
const NEWS_TITLES = [
  'Cách chăm sóc chó Poodle đúng cách cho người mới nuôi',
  'Top 10 giống mèo được yêu thích nhất tại Việt Nam năm 2026',
  'Lịch tiêm phòng cho chó con từ 0-12 tháng tuổi',
  'Dấu hiệu nhận biết mèo bị bệnh và cách xử lý kịp thời',
  'Chế độ dinh dưỡng cho chó béo phì - Giảm cân an toàn',
  'Cách huấn luyện chó đi vệ sinh đúng chỗ trong 7 ngày',
  'Những điều cần biết khi nhận nuôi thú cưng lần đầu',
  'Bệnh dại ở chó mèo - Phòng ngừa và xử lý khẩn cấp',
  'Cách tắm cho mèo không bị cào - Bí quyết từ chuyên gia',
  'Thức ăn nào tốt nhất cho chó Golden Retriever?',
  'Mèo Ba Tư - Đặc điểm, tính cách và cách chăm sóc',
  'Chó Corgi - Giống chó hoàng gia đáng yêu nhất thế giới',
  'Cách phòng ngừa ve rận cho thú cưng trong mùa hè',
  'Tại sao mèo lại kêu nhiều vào ban đêm? Giải thích khoa học',
  'Hướng dẫn cắt móng cho chó tại nhà an toàn',
  'Chó Husky - Giống chó Siberia hùng dũng và trung thành',
  'Dinh dưỡng cho mèo mang thai và cho con bú',
  'Cách xử lý khi chó bị ngộ độc thức ăn',
  'Mèo Anh lông ngắn - Tính cách điềm tĩnh, dễ nuôi',
  'Bí quyết giúp chó và mèo sống hòa thuận trong một nhà',
  'Cách chăm sóc thú cưng khi thời tiết nắng nóng',
  'Chó Shih Tzu - Giống chó hoàng gia nhỏ nhắn đáng yêu',
  'Tại sao chó hay ăn cỏ? Có nguy hiểm không?',
  'Cách dạy mèo không cào sofa và đồ đạc trong nhà',
  'Bệnh giun sán ở chó mèo - Phòng ngừa và điều trị',
  'Chó Labrador - Người bạn đồng hành lý tưởng cho gia đình',
  'Cách chọn thức ăn phù hợp theo độ tuổi của mèo',
  'Mèo Maine Coon - Giống mèo khổng lồ thân thiện',
  'Hội chứng lo âu chia ly ở chó - Nhận biết và điều trị',
  'Cách vệ sinh tai cho chó mèo tại nhà đúng cách',
  'Chó Beagle - Giống chó thám tử thông minh và vui vẻ',
  'Tại sao mèo thích ngủ trên người chủ?',
  'Cách chăm sóc chó già trên 8 tuổi',
  'Mèo Ragdoll - Giống mèo búp bê dịu dàng nhất',
  'Phòng ngừa bệnh tim mạch cho chó lớn tuổi',
  'Cách tập cho chó con đi dây xích không kéo',
  'Dinh dưỡng cho mèo bị bệnh thận mãn tính',
  'Chó Chihuahua - Nhỏ nhắn nhưng đầy cá tính',
  'Cách nhận biết và xử lý khi mèo bị stress',
  'Bệnh parvo ở chó - Nguy hiểm và cách phòng ngừa',
  'Mèo Scottish Fold - Đặc điểm tai cụp độc đáo',
  'Cách chăm sóc lông cho chó Samoyed trắng muốt',
  'Tại sao chó hay liếm chân? Có đáng lo không?',
  'Mèo Siamese - Giống mèo hoàng gia Thái Lan',
  'Cách phòng ngừa béo phì cho mèo nuôi trong nhà',
  'Chó Pomeranian - Bông tuyết nhỏ xinh đáng yêu',
  'Cách xử lý khi mèo bị nôn mửa liên tục',
  'Bệnh viêm khớp ở chó - Dấu hiệu và điều trị',
  'Mèo Bengal - Giống mèo hoang dã trong nhà',
  'Cách tạo môi trường sống lý tưởng cho thú cưng trong căn hộ',
];

const NEWS_DESCRIPTIONS = [
  'Hướng dẫn chi tiết từ các chuyên gia thú y hàng đầu.',
  'Những thông tin hữu ích giúp bạn chăm sóc thú cưng tốt hơn.',
  'Bài viết được tổng hợp từ kinh nghiệm thực tế của các chủ nuôi.',
  'Kiến thức cần thiết cho mọi người yêu thú cưng.',
  'Chia sẻ từ bác sĩ thú y với hơn 10 năm kinh nghiệm.',
  'Cập nhật thông tin mới nhất về chăm sóc sức khỏe thú cưng.',
  'Lời khuyên thiết thực giúp thú cưng của bạn luôn khỏe mạnh.',
  'Tổng hợp kiến thức từ các nguồn uy tín trong và ngoài nước.',
];

const NEWS_CONTENT_TEMPLATE = (title) => `
<h2>${title}</h2>

<p>Chào mừng bạn đến với bài viết của <strong>PetAdopt</strong> - nơi chia sẻ kiến thức và kinh nghiệm chăm sóc thú cưng.</p>

<h3>Giới thiệu</h3>
<p>Nuôi thú cưng là một trải nghiệm tuyệt vời mang lại niềm vui và hạnh phúc cho cả gia đình. Tuy nhiên, để thú cưng luôn khỏe mạnh và hạnh phúc, người nuôi cần trang bị đầy đủ kiến thức và kỹ năng chăm sóc.</p>

<h3>Nội dung chính</h3>
<p>Trong bài viết này, chúng tôi sẽ chia sẻ những thông tin quan trọng và hữu ích nhất về chủ đề <em>${title.toLowerCase()}</em>.</p>

<ul>
  <li>Hiểu rõ đặc điểm và nhu cầu của thú cưng</li>
  <li>Chế độ dinh dưỡng phù hợp theo từng giai đoạn</li>
  <li>Lịch khám sức khỏe và tiêm phòng định kỳ</li>
  <li>Vệ sinh và chăm sóc lông, móng, tai, răng</li>
  <li>Nhận biết dấu hiệu bệnh sớm để can thiệp kịp thời</li>
</ul>

<h3>Lời khuyên từ chuyên gia</h3>
<p>Theo các bác sĩ thú y tại PetAdopt, việc theo dõi sức khỏe thú cưng thường xuyên là điều quan trọng nhất. Hãy đưa thú cưng đi khám định kỳ ít nhất 2 lần/năm và tiêm phòng đầy đủ theo lịch.</p>

<blockquote>
  <p><em>"Thú cưng không thể nói lên nỗi đau của mình, vì vậy người nuôi cần quan sát và lắng nghe ngôn ngữ cơ thể của chúng."</em></p>
  <footer>— Bác sĩ thú y PetAdopt</footer>
</blockquote>

<h3>Kết luận</h3>
<p>Chăm sóc thú cưng đúng cách không chỉ giúp chúng sống khỏe mạnh và hạnh phúc mà còn tạo nên mối quan hệ gắn bó sâu sắc giữa người và vật nuôi. Hãy luôn yêu thương và quan tâm đến người bạn nhỏ của bạn!</p>

<p>Nếu bạn có thắc mắc, hãy liên hệ với đội ngũ chuyên gia của chúng tôi qua email hoặc hotline.</p>
`;

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // ── Seed Products ──
  const existingProducts = await Product.countDocuments();
  if (existingProducts >= 30) {
    console.log(`⏭️  Đã có ${existingProducts} sản phẩm, bỏ qua seed products`);
  } else {
    await Product.insertMany(PRODUCTS);
    console.log(`✅ Đã thêm ${PRODUCTS.length} sản phẩm mẫu`);
  }

  // ── Seed News ──
  const existingNews = await News.countDocuments();
  if (existingNews >= 50) {
    console.log(`⏭️  Đã có ${existingNews} bài viết, bỏ qua seed news`);
  } else {
    const newsData = NEWS_TITLES.map((title, i) => ({
      title,
      description: NEWS_DESCRIPTIONS[i % NEWS_DESCRIPTIONS.length],
      content: NEWS_CONTENT_TEMPLATE(title),
      image: pick(IMG.news),
      status: 'published',
      createdAt: new Date(Date.now() - (50 - i) * 24 * 60 * 60 * 1000), // mỗi bài cách nhau 1 ngày
    }));
    await News.insertMany(newsData);
    console.log(`✅ Đã thêm ${newsData.length} bài viết mẫu`);
  }

  await mongoose.disconnect();
  console.log('🎉 Seed hoàn tất!');
}

seed().catch(err => {
  console.error('❌ Seed thất bại:', err.message);
  process.exit(1);
});

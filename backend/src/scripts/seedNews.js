const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String },
  image: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const News = mongoose.models.News || mongoose.model('News', newsSchema);

const newsData = [
  {
    title: "Chiến dịch cứu trợ 50 chú chó từ trại giết mổ thành công",
    description: "Sau 2 tuần nỗ lực không ngừng nghỉ, đội ngũ của chúng tôi đã giải cứu thành công 50 chú chó khỏi trại giết mổ tại tỉnh Thái Nguyên.",
    content: `Vào ngày 15/04/2026, đội cứu hộ của Pet Adopt đã thực hiện một chiến dịch giải cứu quy mô lớn tại một trại giết mổ chó mèo bất hợp pháp ở Thái Nguyên.

Sau khi nhận được tin báo từ người dân địa phương, chúng tôi đã phối hợp với chính quyền và lực lượng công an để tiến hành giải cứu. Tổng cộng 50 chú chó với nhiều giống khác nhau đã được đưa về trung tâm cứu hộ của chúng tôi.

Hiện tại, tất cả các bé đều đang được chăm sóc y tế, tiêm phòng đầy đủ và phục hồi sức khỏe. Nhiều bé đã có tinh thần tốt hơn và bắt đầu tin tưởng con người trở lại.

Chúng tôi đang tìm kiếm những gia đình yêu thương để nhận nuôi các bé. Nếu bạn quan tâm, hãy liên hệ với chúng tôi qua hotline: 0866192325.

Cảm ơn tất cả những người đã ủng hộ và đồng hành cùng chúng tôi trong chiến dịch này!`,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200",
    status: "published"
  },
  {
    title: "Chương trình tiêm phòng miễn phí cho thú cưng tháng 5/2026",
    description: "Pet Adopt phối hợp cùng các bác sĩ thú y tổ chức chương trình tiêm phòng miễn phí cho hơn 200 chú chó mèo trong cộng đồng.",
    content: `Nhằm nâng cao sức khỏe cộng đồng và phòng ngừa dịch bệnh, Pet Adopt tổ chức chương trình tiêm phòng miễn phí vào các ngày 10, 17, 24 và 31 tháng 5/2026.

Chương trình bao gồm:
- Tiêm phòng dại (Rabies)
- Tiêm phòng 5 bệnh cho chó (DHPPi)
- Tiêm phòng 3 bệnh cho mèo (Feline)
- Khám sức khỏe tổng quát miễn phí
- Tư vấn chăm sóc thú cưng

Địa điểm: Trung tâm Pet Adopt, 123 Lê Lợi, Hải Phòng
Thời gian: 8h00 - 17h00 các ngày Chủ nhật

Đăng ký trước qua hotline: 0866192325 để được ưu tiên phục vụ.

Lưu ý: Mang theo sổ tiêm phòng (nếu có) và đảm bảo thú cưng khỏe mạnh trước khi tiêm.`,
    image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1200",
    status: "published"
  },
  {
    title: "Câu chuyện cảm động: Chú chó Max tìm lại chủ sau 3 năm lạc mất",
    description: "Sau 3 năm lang thang trên đường phố, chú chó Max đã được đoàn tụ với gia đình nhờ chip định vị và sự giúp đỡ của Pet Adopt.",
    content: `Max, một chú chó Golden Retriever 5 tuổi, đã lạc mất chủ từ năm 2023 khi gia đình đang di chuyển từ Hà Nội vào Sài Gòn. Suốt 3 năm qua, Max đã sống lang thang trên đường phố, tự kiếm ăn và chịu đựng mọi thời tiết khắc nghiệt.

Vào tháng 4/2026, Max được một người dân tốt bụng phát hiện và đưa đến trung tâm Pet Adopt. Nhờ có chip định vị được cấy từ trước, chúng tôi đã liên hệ được với gia đình của Max.

Cảnh đoàn tụ giữa Max và gia đình thật sự cảm động. Chú chó đã nhận ra chủ ngay lập tức và không ngừng vẫy đuôi, liếm mặt chủ. Cả gia đình đều rơi nước mắt vì hạnh phúc.

Câu chuyện này một lần nữa nhắc nhở chúng ta về tầm quan trọng của việc cấy chip định vị cho thú cưng. Đây là cách tốt nhất để bảo vệ các bé và tăng cơ hội tìm lại khi bị thất lạc.

Pet Adopt cung cấp dịch vụ cấy chip miễn phí cho tất cả thú cưng được nhận nuôi từ trung tâm.`,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200",
    status: "published"
  },
  {
    title: "Hướng dẫn chăm sóc chó mèo mới sinh đúng cách",
    description: "Bài viết chi tiết về cách chăm sóc chó mèo con từ 0-3 tháng tuổi, giúp các bé phát triển khỏe mạnh và toàn diện.",
    content: `Chăm sóc chó mèo mới sinh đòi hỏi sự tỉ mỉ và kiên nhẫn. Dưới đây là hướng dẫn chi tiết từ các bác sĩ thú y của Pet Adopt:

**Tuần 1-2: Giai đoạn sơ sinh**
- Giữ ấm cho các bé (28-30°C)
- Cho bú sữa mẹ hoặc sữa thay thế mỗi 2-3 giờ
- Kích thích đại tiểu bằng khăn ẩm
- Cân nặng mỗi ngày để theo dõi sự phát triển

**Tuần 3-4: Bắt đầu mở mắt**
- Tiếp tục cho bú đều đặn
- Bắt đầu tập đi lại
- Vệ sinh nhẹ nhàng
- Tránh tiếp xúc với động vật khác

**Tháng 2-3: Cai sữa**
- Bắt đầu cho ăn thức ăn mềm
- Tiêm phòng đầu tiên (6-8 tuần tuổi)
- Tẩy giun định kỳ
- Xã hội hóa với người và động vật khác

**Lưu ý quan trọng:**
- Không tắm cho bé dưới 2 tháng tuổi
- Giữ môi trường sạch sẽ, khô ráo
- Theo dõi sức khỏe hàng ngày
- Liên hệ bác sĩ thú y khi có dấu hiệu bất thường

Nếu bạn cần tư vấn thêm, hãy liên hệ với Pet Adopt qua hotline: 0866192325`,
    image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200",
    status: "published"
  },
  {
    title: "Sự kiện Ngày hội thú cưng 2026 - Kết nối yêu thương",
    description: "Tham gia Ngày hội thú cưng lớn nhất năm với nhiều hoạt động thú vị, thi tài năng, và cơ hội nhận nuôi các bé đáng yêu.",
    content: `Pet Adopt trân trọng kính mời quý vị và các bạn tham dự "Ngày hội thú cưng 2026 - Kết nối yêu thương" sẽ được tổ chức vào:

**Thời gian:** Chủ nhật, 15/06/2026, 8h00 - 18h00
**Địa điểm:** Công viên Hồ Gươm, Hà Nội

**Các hoạt động chính:**

1. **Triển lãm thú cưng**
   - Giới thiệu hơn 100 chú chó mèo đang chờ nhận nuôi
   - Tư vấn miễn phí về chăm sóc thú cưng
   - Cấy chip định vị miễn phí

2. **Thi tài năng thú cưng**
   - Giải nhất: 5.000.000đ + 1 năm thức ăn miễn phí
   - Giải nhì: 3.000.000đ
   - Giải ba: 2.000.000đ
   - Nhiều giải khuyến khích

3. **Khu vui chơi**
   - Đường chạy Agility
   - Bể bơi cho chó
   - Khu chụp ảnh check-in
   - Khu ẩm thực

4. **Hội chợ sản phẩm**
   - Giảm giá 30-50% tất cả sản phẩm
   - Quà tặng cho 100 khách hàng đầu tiên
   - Tư vấn dinh dưỡng miễn phí

**Đăng ký tham gia:**
- Website: petadopt.vn/event
- Hotline: 0866192325
- Miễn phí vé vào cửa

Hãy cùng nhau tạo nên một ngày hội ý nghĩa, lan tỏa thông điệp yêu thương và bảo vệ động vật!`,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200",
    status: "published"
  },
  {
    title: "10 lý do nên nhận nuôi thú cưng thay vì mua",
    description: "Nhận nuôi thú cưng không chỉ cứu một mạng sống mà còn mang lại nhiều lợi ích cho cả gia đình và cộng đồng.",
    content: `Nhiều người vẫn còn băn khoăn giữa việc mua hay nhận nuôi thú cưng. Dưới đây là 10 lý do thuyết phục bạn nên chọn nhận nuôi:

**1. Cứu một mạng sống**
Mỗi năm có hàng nghìn chú chó mèo bị bỏ rơi. Nhận nuôi giúp các bé có cơ hội sống và được yêu thương.

**2. Chi phí thấp hơn**
Thú cưng từ trung tâm cứu hộ thường đã được tiêm phòng, triệt sản và khám sức khỏe.

**3. Đa dạng lựa chọn**
Từ chó mèo con đến trưởng thành, nhiều giống khác nhau để bạn lựa chọn.

**4. Được tư vấn kỹ càng**
Đội ngũ chuyên nghiệp sẽ giúp bạn chọn thú cưng phù hợp với hoàn cảnh gia đình.

**5. Thú cưng đã được huấn luyện**
Nhiều bé đã quen với việc đi vệ sinh đúng chỗ và các kỹ năng cơ bản.

**6. Hỗ trợ sau nhận nuôi**
Pet Adopt luôn sẵn sàng tư vấn và hỗ trợ suốt quá trình nuôi dưỡng.

**7. Chống lại nạn buôn bán động vật**
Nhận nuôi giúp giảm nhu cầu mua bán, từ đó hạn chế tình trạng nhân giống vô tội vạ.

**8. Gương tốt cho con trẻ**
Dạy trẻ về lòng trắc ẩn và trách nhiệm với động vật.

**9. Tạo không gian cho bé khác**
Mỗi bé được nhận nuôi tạo chỗ cho một bé khác được cứu trợ.

**10. Tình yêu vô điều kiện**
Thú cưng được cứu trợ thường rất biết ơn và gắn bó với chủ.

Hãy đến Pet Adopt để tìm người bạn đồng hành của bạn!`,
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200",
    status: "published"
  },
  {
    title: "Cảnh báo: Dịch Parvo đang lây lan trong cộng đồng chó",
    description: "Bệnh Parvo đang có dấu hiệu gia tăng tại khu vực Hà Nội. Hãy tiêm phòng ngay cho thú cưng của bạn để bảo vệ các bé.",
    content: `**CẢNH BÁO KHẨN CẤP**

Trong 2 tuần qua, Pet Adopt đã ghi nhận hơn 15 ca nhiễm bệnh Parvo (Parvovirus) ở chó tại khu vực Hà Nội và các tỉnh lân cận. Đây là căn bệnh nguy hiểm, có thể gây tử vong cao nếu không được điều trị kịp thời.

**Triệu chứng nhận biết:**
- Tiêu chảy nặng, phân có máu
- Nôn mửa liên tục
- Sốt cao, mệt mỏi
- Mất nước nhanh chóng
- Không ăn uống

**Cách phòng ngừa:**
1. Tiêm phòng đầy đủ (vaccine 5 bệnh)
2. Tránh cho chó tiếp xúc với chó lạ
3. Không dắt chó đi nơi đông người/chó
4. Vệ sinh môi trường sống thường xuyên
5. Cách ly ngay khi có dấu hiệu bệnh

**Lịch tiêm phòng khuyến nghị:**
- Mũi 1: 6-8 tuần tuổi
- Mũi 2: 10-12 tuần tuổi
- Mũi 3: 14-16 tuần tuổi
- Nhắc lại: Hàng năm

**Chương trình hỗ trợ:**
Pet Adopt đang triển khai chương trình tiêm phòng Parvo với giá ưu đãi 200.000đ/mũi (giảm 50%).

Nếu thú cưng của bạn có dấu hiệu bệnh, hãy liên hệ ngay:
- Hotline: 0866192325
- Địa chỉ: 123 Lê Lợi, Hải Phòng
- Khám cấp cứu 24/7

Hãy bảo vệ thú cưng của bạn trước khi quá muộn!`,
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200",
    status: "published"
  },
  {
    title: "Tình nguyện viên của tháng: Chị Nguyễn Thị Lan",
    description: "Gặp gỡ chị Lan - người đã dành hơn 5 năm tình nguyện chăm sóc hơn 200 chú chó mèo tại Pet Adopt.",
    content: `Trong số hàng trăm tình nguyện viên của Pet Adopt, chị Nguyễn Thị Lan (32 tuổi, Hà Nội) là một trong những người đặc biệt nhất. Với hơn 5 năm cống hiến không ngừng nghỉ, chị đã trở thành "người mẹ" của hơn 200 chú chó mèo.

**Câu chuyện của chị Lan:**

"Tôi bắt đầu làm tình nguyện viên từ năm 2021, sau khi cứu được một chú chó bị tai nạn trên đường. Từ đó, tôi không thể ngừng giúp đỡ các bé. Mỗi sáng thức dậy, điều đầu tiên tôi nghĩ đến là các bé đã ăn chưa, có khỏe không."

**Những đóng góp nổi bật:**

- Chăm sóc trực tiếp hơn 200 chú chó mèo
- Tổ chức 15 chiến dịch cứu hộ thành công
- Kết nối 80+ gia đình nhận nuôi
- Quyên góp được hơn 100 triệu đồng
- Đào tạo 50+ tình nguyện viên mới

**Chia sẻ của chị:**

"Làm tình nguyện không phải lúc nào cũng dễ dàng. Có những đêm tôi phải thức trắng chăm sóc bé bị bệnh nặng. Có những lúc tôi khóc vì không cứu được bé. Nhưng mỗi khi thấy một bé được nhận nuôi, được yêu thương, tất cả mệt mỏi đều tan biến."

**Lời kêu gọi:**

"Tôi mong mọi người hãy cho các bé một cơ hội. Chúng không cần nhiều, chỉ cần một mái nhà ấm áp và tình yêu thương. Nếu bạn không thể nhận nuôi, hãy ủng hộ bằng cách quyên góp hoặc chia sẻ thông tin. Mỗi hành động nhỏ đều có ý nghĩa lớn."

Pet Adopt xin gửi lời cảm ơn sâu sắc đến chị Lan và tất cả các tình nguyện viên đã và đang đồng hành cùng chúng tôi!

**Bạn muốn trở thành tình nguyện viên?**
Đăng ký tại: petadopt.vn/volunteer
Hotline: 0866192325`,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200",
    status: "published"
  }
];

async function seedNews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing news
    await News.deleteMany({});
    console.log('🗑️  Cleared existing news');

    // Insert new news
    const result = await News.insertMany(newsData);
    console.log(`✅ Successfully seeded ${result.length} news articles`);

    console.log('\n📰 News articles:');
    result.forEach((news, index) => {
      console.log(`${index + 1}. ${news.title}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding news:', error);
    process.exit(1);
  }
}

seedNews();

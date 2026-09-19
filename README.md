# PTE Intensive — Student Progress Tracking

MVP quản lý học viên PTE Academic: ngày bắt đầu, ngày thi dự kiến, điểm mục tiêu, tiến độ từng task và báo cáo học tập hằng tuần. Dự án sử dụng Next.js, TypeScript, Tailwind CSS và Firebase.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Firebase

Ứng dụng chỉ đọc/ghi học viên từ collection Firestore `students`, không sử dụng dữ liệu demo hoặc fallback localStorage. File `/Users/trieuthanhngan/NextJS/StudentProgressTracking/data/students.ts` chỉ chứa các kiểu TypeScript.

Cấu hình Firebase Web hiện được khai báo trong `/Users/trieuthanhngan/NextJS/StudentProgressTracking/lib/firebase.ts` cho project `student-9c986`. Không ghi đè file môi trường chứa cấu hình Clerk khi thay đổi Firebase.

Khi collection trống, giao diện hiển thị trạng thái chưa có học viên. Khi tải lỗi, ứng dụng hiển thị thông báo lỗi, không thay bằng dữ liệu mẫu. Các chỉ số tổng quan, hiệu suất task và tổng hợp báo cáo được tính từ dữ liệu đã tải; tổng hợp báo cáo bao gồm tất cả tuần đã lưu, không phải riêng bốn tuần gần nhất.

## Nhận diện PTE Intensive

Toàn bộ giao diện sử dụng palette thương hiệu: `#fc5d01`, `#fd7f33`, `#ffac7b`, `#fdbc94`, `#fedac2` và `#ffffff`. Dữ liệu cũ có màu avatar ngoài palette sẽ được tự động ánh xạ sang màu PTE Intensive khi tải.

## Thêm, sửa và xóa học viên

- Nhấn **Thêm học viên** trên dashboard để tạo hồ sơ PTE mới.
- Mã học viên được điền tự động theo dạng `PTE-<UUID>` và không thể sửa. Form không yêu cầu email hoặc số điện thoại; thông tin liên hệ cũ được giữ nguyên trong dữ liệu khi cập nhật hồ sơ.
- Dùng biểu tượng bút chì trên mỗi dòng hoặc nút **Sửa thông tin** trong hồ sơ để cập nhật.
- Dùng biểu tượng thùng rác hoặc nút **Xóa học viên**; hệ thống luôn yêu cầu xác nhận trước khi xóa.
- Form kiểm tra trường bắt buộc, mã học viên trùng, giới hạn điểm PTE và thứ tự ngày bắt đầu/ngày thi.
- Mỗi học viên có thể được phân công **nhiều giảng viên phụ trách** và **nhiều trợ giảng hỗ trợ** trong form thêm/sửa. Nhập tên rồi nhấn Enter, dấu phẩy hoặc nút **Thêm**; có thể xóa từng người bằng nút trên thẻ tên.
- Có thể tìm kiếm học viên theo tên giảng viên hoặc trợ giảng; hai thông tin này cũng được đưa vào file CSV.

Dữ liệu CRUD chỉ được lưu trong Firestore. Nếu Firebase chưa cấu hình hoặc không cho phép truy cập, thao tác sẽ báo lỗi thay vì lưu cục bộ. Dữ liệu localStorage cũ không được đọc hoặc tự động nhập vào Firebase. Việc loại bỏ dữ liệu demo trong code không xóa bất kỳ document nào đã có trong Firestore.

Các thao tác Firestore đang sử dụng:

- `getDocs`: tải danh sách học viên.
- `setDoc`: thêm hoặc cập nhật học viên theo mã PTE.
- `deleteDoc`: xóa học viên.

Firebase project cần có Security Rules cho phép người dùng phù hợp đọc và ghi collection `students`. Không nên cho phép ghi công khai trong môi trường production; hãy bổ sung Firebase Authentication trước khi triển khai thực tế.

## Cập nhật tình hình học hằng tuần

- Mỗi task có nhiều người phụ trách (nhập tên phân cách bằng dấu phẩy hoặc xuống dòng), tiến độ dạng văn bản và hạn chế cần cải thiện. Đây là tên ghi nhận, không phải gán quyền tài khoản Clerk.
- Báo cáo tuần lưu snapshot người phụ trách, tiến độ và hạn chế của từng task. Cập nhật tuần mới nhất đồng bộ về task hiện tại; sửa tuần cũ không ghi đè tiến độ hiện tại.
- Mỗi tuần ghi riêng số buổi vắng có phép/không phép (để trống nếu chưa ghi nhận), tình trạng bài tập về nhà, hạn chế chung và đánh giá khuyến khích thi. Tỷ lệ chuyên cần vẫn được nhập riêng, không tự suy ra từ số buổi vắng.
- Hồ sơ cũ chưa có các trường này hiển thị “Chưa ghi nhận” hoặc “Chưa đánh giá”; không tự coi là có làm bài hoặc được khuyến khích thi.

- Nhấn biểu tượng báo cáo màu xanh trên dòng học viên hoặc nút **Cập nhật tuần** trong hồ sơ.
- Nhập tuần học, khoảng ngày, số buổi, tổng task, điểm mock, chuyên cần và nhận xét giáo viên.
- Ghi điểm và số câu đã luyện riêng trong tuần cho từng PTE task của học viên.
- Nhấn biểu tượng bút chì bên cạnh một tuần trong hồ sơ để sửa báo cáo cũ.
- Hệ thống ngăn trùng tên tuần và kiểm tra khoảng ngày, điểm số, số buổi, số task, chuyên cần.
- Khi thêm tuần mới hoặc sửa tuần gần nhất, điểm mock, chuyên cần và điểm task hiện tại của học viên được đồng bộ tự động.
- Khi sửa tuần cũ, hệ thống giữ nguyên điểm hiện tại và chỉ điều chỉnh tổng số câu luyện theo phần chênh lệch, tránh cộng trùng.

Báo cáo tuần được lưu trong trường `weeklyReports` của document học viên. Chi tiết từng task trong tuần được lưu tại `weeklyReports[].taskResults`.

## Thêm, sửa và xóa PTE tasks

Task được quản lý riêng theo từng học viên để mỗi người có thể theo một lộ trình PTE khác nhau.

- Nhấn biểu tượng quyển sách màu xanh trên dòng học viên hoặc nút **Quản lý tasks** trong hồ sơ.
- Nhấn **Thêm task** và nhập mã task, tên, kỹ năng, điểm hiện tại, điểm mục tiêu và tổng số câu đã luyện.
- Nhấn biểu tượng bút chì trên task để sửa; mã task có thể thay đổi.
- Nhấn biểu tượng thùng rác để xóa và xác nhận trước khi thực hiện.
- Mã task được chuẩn hóa thành chữ hoa, chỉ cho phép chữ, số, dấu gạch ngang và không được trùng trong cùng một học viên.
- Khi đổi mã task, mã tương ứng trong báo cáo tuần cũ được cập nhật để giữ liên kết lịch sử.
- Khi xóa task, task bị loại khỏi tiến độ hiện tại và form cập nhật tuần tiếp theo; snapshot của báo cáo tuần cũ vẫn được giữ lại.
- Có thể xóa hết task và thêm lại sau; các màn hình danh sách, CSV và báo cáo tuần vẫn xử lý trạng thái trống an toàn.

Mọi thay đổi task được lưu trong trường `tasks` của document học viên qua Firestore. Form cập nhật tuần luôn lấy danh sách task mới nhất của học viên.

Danh sách giảng viên và trợ giảng được lưu tại `instructors: string[]` và `teachingAssistants: string[]` trong document học viên. Tên trùng trong cùng nhóm bị loại bỏ. Dữ liệu cũ dùng `instructor: string` và `teachingAssistant: string` được tự động chuyển sang mảng khi tải; hồ sơ chưa có người hỗ trợ sẽ hiển thị **Chưa phân công**.

## Scripts

- `npm run dev`: chạy môi trường phát triển.
- `npm run lint`: kiểm tra ESLint.
- `npm run build`: tạo production build.
- `npm start`: chạy production build.
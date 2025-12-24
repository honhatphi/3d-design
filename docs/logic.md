# LOGIC VẬN HÀNH HỆ THỐNG SHUTTLE & WAREHOUSE 3D

## 1. Cấu Trúc Hệ Thống (System Layout)

### Hệ trục tọa độ

- **X (Depth - Chiều sâu):** 1 → 25
- **Y (Rail - Hàng ngang):** 1 → 23
- **Z (Level - Tầng):** 1 → 4

### Phân vùng hoạt động (Zones)

Hệ thống được chia thành 2 vùng riêng biệt dựa trên trục Y để tối ưu hóa hiệu suất và tránh va chạm.

| Đặc tính                     | **Shuttle 1 (Zone A)** | **Shuttle 2 (Zone B)** |
| :--------------------------- | :--------------------- | :--------------------- |
| **Phạm vi Rail (Y)**         | Rail 1 → Rail 11       | Rail 13 → Rail 23      |
| **Highway (Trục lộ chính)**  | **Y = 4**              | **Y = 20**             |
| **Vị trí Thang Nâng (Lift)** | Tọa độ (X: 2, Y: 5)    | Tọa độ (X: 2, Y: 19)   |

---

## 2. Nguyên Tắc Di Chuyển Cốt Lõi (Core Principles)

Để đảm bảo an toàn vật lý và tránh va chạm hàng hóa, Shuttle phải tuân thủ tuyệt đối các nguyên tắc sau:

1.  **Nguyên tắc "Xương Cá" (Manhattan Routing):**
    - **Highway:** Là nơi duy nhất Shuttle được phép di chuyển tự do theo trục X (Depth) để đi xa.
    - **Rack (Trong kệ):** Khi đang ở trong kệ (Y ≠ Highway), Shuttle **TUYỆT ĐỐI KHÔNG** được thay đổi X.
2.  **Nguyên tắc "Thoát - Chạy - Vào":**
    - Nếu đích đến có Depth (X) khác với hiện tại, Shuttle bắt buộc phải thoát ra Highway trước, di chuyển đến Depth mới, rồi mới rẽ vào đích.
3.  **Nguyên tắc Đổi Tầng:**
    - Shuttle không thể tự bay lên tầng trên. Nếu đích đến khác tầng (Z), Shuttle phải coi Thang Nâng là đích đến trung gian.

---

## 3. Luồng Logic Tổng Quát (Master Workflow)

Khi nhận một lệnh di chuyển từ điểm **A** đến điểm **B**, hệ thống xử lý theo quy trình sau:

### BƯỚC 1: Kiểm tra Tầng (Check Z-Level)

So sánh Tầng hiện tại ($Z_{start}$) và Tầng đích ($Z_{target}$).

- **TRƯỜNG HỢP 1: Cùng Tầng ($Z_{start} == Z_{target}$)**
  - Thực hiện quy trình điều hướng (X-Y) trực tiếp từ A đến B.

- **TRƯỜNG HỢP 2: Khác Tầng ($Z_{start} \neq Z_{target}$)**
  - Hệ thống chia hành trình thành 3 giai đoạn (Multi-stage):
    1.  **Giai đoạn 1:** Di chuyển từ A đến **Thang Nâng** (tại tầng hiện tại).
    2.  **Giai đoạn 2:** Thang nâng vận chuyển Shuttle đến tầng đích.
    3.  **Giai đoạn 3:** Di chuyển từ **Thang Nâng** đến B (tại tầng đích).

### BƯỚC 2: Quy trình Điều hướng X-Y (Navigation Logic)

Áp dụng cho mọi hành trình di chuyển trên cùng một mặt sàn.

1.  **Pha 1: ESCAPE (Thoát ra Highway)**
    - _Điều kiện:_ Nếu Shuttle đang không ở Highway VÀ cần thay đổi Depth (X) hoặc đổi Rail (Y).
    - _Hành động:_ Di chuyển Y từ vị trí hiện tại về Y Highway.
    - _Ràng buộc:_ Giữ nguyên X.

2.  **Pha 2: TRAVEL (Di chuyển dọc Highway)**
    - _Điều kiện:_ Khi Shuttle đã ở trên Highway.
    - _Hành động:_ Di chuyển X từ vị trí hiện tại đến X của đích.
    - _Ràng buộc:_ Giữ nguyên Y (luôn ở trên Highway).

3.  **Pha 3: APPROACH (Tiếp cận đích)**
    - _Điều kiện:_ Khi Shuttle đang ở trên Highway và đã đúng Depth (X) của đích.
    - _Hành động:_ Di chuyển Y từ Highway vào vị trí Y của đích.
    - _Ràng buộc:_ Giữ nguyên X.

---

## 4. Mô Phỏng Kịch Bản Thực Tế (Scenario Simulation)

**Kịch bản:**

- **Đối tượng:** Shuttle 1 (Hoạt động vùng Rail 1-11, Highway Y=4, Thang tại X=2, Y=5).
- **Vị trí hiện tại (Start):** `X: 20` | `Y: 8` | `Z: 1` (Đang nằm sâu trong kệ tại tầng 1).
- **Vị trí cần lấy hàng (Target):** `X: 15` | `Y: 10` | `Z: 3` (Nằm ở tầng 3).

### QUÁ TRÌNH THỰC THI CHI TIẾT

#### GIAI ĐOẠN 1: TÌM VỀ THANG MÁY (Tại Tầng 1)

_Mục tiêu: Đi từ (20, 8) đến Thang máy (2, 5)._

1.  **Phân tích:** Shuttle đang ở Rail 8 (Trong kệ), cần về Lift ở Rail 5, X=2. Không thể đi chéo, không thể chạy dọc X tại Rail 8.
2.  **Bước 1 - Escape (Ra Highway):**
    - Di chuyển Y: Từ `8` về `4` (Highway).
    - Vị trí tạm: `(20, 4, 1)`.
3.  **Bước 2 - Travel (Về đầu dãy):**
    - Di chuyển X: Từ `20` về `2` (Depth của thang).
    - Vị trí tạm: `(2, 4, 1)`.
4.  **Bước 3 - Approach (Vào Thang):**
    - Di chuyển Y: Từ `4` sang `5` (Vị trí Thang).
    - Vị trí tạm: `(2, 5, 1)`. -> **Shuttle đã vào lồng thang.**

#### GIAI ĐOẠN 2: THANG MÁY VẬN HÀNH

- Thang máy di chuyển trục Z từ Tầng 1 lên Tầng 3.
- Vị trí mới của Shuttle: `(2, 5, 3)`.

#### GIAI ĐOẠN 3: ĐI ĐẾN VỊ TRÍ LẤY HÀNG (Tại Tầng 3)

_Mục tiêu: Đi từ Thang (2, 5) đến Hàng (15, 10)._

1.  **Phân tích:** Shuttle đang trong Thang (Rail 5), cần ra Rail 10, Depth 15.
2.  **Bước 1 - Escape (Rời Thang ra Highway):**
    - Di chuyển Y: Từ `5` về `4` (Highway).
    - Vị trí tạm: `(2, 4, 3)`.
3.  **Bước 2 - Travel (Đến Depth hàng):**
    - Di chuyển X: Từ `2` chạy đến `15`.
    - Vị trí tạm: `(15, 4, 3)`.
4.  **Bước 3 - Approach (Vào Kệ lấy hàng):**
    - Di chuyển Y: Từ `4` vào `10`.
    - Vị trí cuối cùng: `(15, 10, 3)`. -> **HOÀN THÀNH.**

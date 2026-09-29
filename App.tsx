import React, { useState, useMemo } from 'react';
import { 
  Coffee, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  ReceiptText, 
  ClipboardList,
  Plus,
  Minus
} from 'lucide-react';

/**
 * 음료 메뉴 인터페이스 정의
 */
interface DrinkOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

/**
 * 사이즈 옵션 인터페이스 정의
 */
interface SizeOption {
  id: 'S' | 'M' | 'L';
  name: string;
  extraPrice: number;
}

/**
 * 추가 옵션 인터페이스 정의
 */
interface ExtraOption {
  id: string;
  name: string;
  extraPrice: number;
}

/**
 * 주문 접수 내역 인터페이스 정의
 */
interface OrderRecord {
  id: string;
  customerName: string;
  phoneNumber: string;
  drinkName: string;
  drinkPrice: number;
  size: 'S' | 'M' | 'L';
  sizeExtraPrice: number;
  selectedOptions: string[];
  quantity: number;
  requests: string;
  totalPrice: number;
  formattedMessage: string;
  createdAt: string;
}

// ☕ 바이브 카페 음료 메뉴 목록
const DRINK_LIST: DrinkOption[] = [
  { id: 'americano', name: '아메리카노', price: 3500, description: '진하고 깊은 풍미의 에스프레소 블렌드' },
  { id: 'latte', name: '카페라떼', price: 4000, description: '부드러운 우유와 에스프레소의 조화' },
  { id: 'mocha', name: '카페모카', price: 4500, description: '달콤한 초콜릿과 풍부한 에스프레소' },
  { id: 'vanilla', name: '바닐라라떼', price: 4500, description: '은은한 마다가스카르 바닐라 빈 풍미' },
  { id: 'greentea', name: '녹차라떼', price: 4500, description: '제주 유기농 녹차의 깊고 진한 맛' },
];

// 📏 사이즈 옵션 목록 (기본 선택: M)
const SIZE_LIST: SizeOption[] = [
  { id: 'S', name: 'S (+0원)', extraPrice: 0 },
  { id: 'M', name: 'M (+500원)', extraPrice: 500 },
  { id: 'L', name: 'L (+1,000원)', extraPrice: 1000 },
];

// ➕ 추가 옵션 목록
const EXTRA_OPTIONS: ExtraOption[] = [
  { id: 'shot', name: '샷 추가 +500원', extraPrice: 500 },
  { id: 'cream', name: '크림 추가 +500원', extraPrice: 500 },
  { id: 'syrup', name: '시럽 추가 +300원', extraPrice: 300 },
  { id: 'decaf', name: '디카페인 +0원', extraPrice: 0 },
];

export default function App() {
  // --- 상태 관리 (State) ---
  const [customerName, setCustomerName] = useState<string>(''); // 1. 이름 (필수)
  const [phoneNumber, setPhoneNumber] = useState<string>('');   // 2. 전화번호 (tel)
  const [selectedDrinkId, setSelectedDrinkId] = useState<string>(''); // 3. 음료 선택 (드롭다운)
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('M'); // 4. 사이즈 (기본값: M)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]); // 5. 추가 옵션 (체크박스)
  const [quantity, setQuantity] = useState<number>(1); // 6. 수량 (기본값: 1, 최소 1, 최대 10)
  const [requests, setRequests] = useState<string>(''); // 7. 요청사항 (textarea)

  // 안내 및 알림 메시지 상태
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<string | null>(null);
  
  // 주문 내역 게시판 기록 (로컬 상태에 누적)
  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>([
    {
      id: 'mock-1',
      customerName: '홍길동',
      phoneNumber: '010-1234-5678',
      drinkName: '카페라떼',
      drinkPrice: 4000,
      size: 'M',
      sizeExtraPrice: 500,
      selectedOptions: ['샷 추가 +500원'],
      quantity: 1,
      requests: '따뜻하게 부탁드립니다.',
      totalPrice: 5000,
      formattedMessage: '홍길동님, 카페라떼 M사이즈 (샷 추가) 1잔, 총 5,000원 주문이 접수되었습니다!',
      createdAt: '오늘 10:30'
    }
  ]);

  // 활성 탭 (주문서 작성 / 주문 내역 게시판)
  const [activeTab, setActiveTab] = useState<'order' | 'board'>('order');

  // --- 실시간 예상 금액 계산 (JavaScript 기능) ---
  const estimatedPrice = useMemo(() => {
    // 음료가 선택되지 않았으면 0원
    const currentDrink = DRINK_LIST.find((d) => d.id === selectedDrinkId);
    if (!currentDrink) return 0;

    // 1) 음료 기본 금액
    const basePrice = currentDrink.price;

    // 2) 사이즈 추가금
    const sizeObj = SIZE_LIST.find((s) => s.id === selectedSize);
    const sizePrice = sizeObj ? sizeObj.extraPrice : 0;

    // 3) 선택된 추가 옵션 금액 합계
    const optionsPrice = selectedOptions.reduce((acc, optName) => {
      const opt = EXTRA_OPTIONS.find((o) => o.name === optName);
      return acc + (opt ? opt.extraPrice : 0);
    }, 0);

    // 4) (기본금액 + 사이즈 + 옵션) * 수량
    const unitPrice = basePrice + sizePrice + optionsPrice;
    return unitPrice * quantity;
  }, [selectedDrinkId, selectedSize, selectedOptions, quantity]);

  // 체크박스 옵션 변경 핸들러
  const handleOptionToggle = (optionName: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionName)
        ? prev.filter((item) => item !== optionName)
        : [...prev, optionName]
    );
  };

  // 수량 증감 핸들러 (최소 1, 최대 10)
  const handleQuantityChange = (val: number) => {
    if (isNaN(val)) {
      setQuantity(1);
      return;
    }
    const clamped = Math.min(10, Math.max(1, val));
    setQuantity(clamped);
  };

  // 주문하기 버튼 클릭 핸들러
  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. 유효성 검사: 이름 입력 여부 확인
    if (!customerName.trim()) {
      setErrorMessage('이름을 입력해주세요');
      setOrderConfirmation(null);
      const nameInput = document.getElementById('customer-name');
      nameInput?.focus();
      return;
    }

    // 2. 유효성 검사: 음료 선택 여부 확인
    if (!selectedDrinkId) {
      setErrorMessage('음료를 선택해주세요');
      setOrderConfirmation(null);
      const drinkSelect = document.getElementById('drink-select');
      drinkSelect?.focus();
      return;
    }

    const currentDrink = DRINK_LIST.find((d) => d.id === selectedDrinkId);
    if (!currentDrink) return;

    // 옵션 텍스트 정리 (예: "샷 추가 +500원" -> "샷 추가")
    const optionLabels = selectedOptions.map((opt) => opt.split(' +')[0]);
    const optionText = optionLabels.length > 0 ? ` (${optionLabels.join(', ')})` : '';

    // 주문 확인 메시지 형식 생성
    // 예: "홍길동님, 카페라떼 M사이즈 (샷 추가) 1잔, 총 5,000원 주문이 접수되었습니다!"
    const confirmationText = `${customerName.trim()}님, ${currentDrink.name} ${selectedSize}사이즈${optionText} ${quantity}잔, 총 ${estimatedPrice.toLocaleString()}원 주문이 접수되었습니다!`;

    setOrderConfirmation(confirmationText);
    setErrorMessage(null);

    // 주문 내역 게시판에 기록 추가
    const newOrder: OrderRecord = {
      id: `order-${Date.now()}`,
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim() || '미입력',
      drinkName: currentDrink.name,
      drinkPrice: currentDrink.price,
      size: selectedSize,
      sizeExtraPrice: SIZE_LIST.find((s) => s.id === selectedSize)?.extraPrice || 0,
      selectedOptions: [...selectedOptions],
      quantity,
      requests: requests.trim(),
      totalPrice: estimatedPrice,
      formattedMessage: confirmationText,
      createdAt: '방금 전'
    };

    setOrderHistory((prev) => [newOrder, ...prev]);

    // 주문 성공 안내 후 부드럽게 확인 메시지 영역으로 스크롤
    setTimeout(() => {
      document.getElementById('confirmation-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 다시 작성 버튼 클릭 핸들러 (모든 입력과 금액 초기화)
  const handleReset = () => {
    setCustomerName('');
    setPhoneNumber('');
    setSelectedDrinkId('');
    setSelectedSize('M');
    setSelectedOptions([]);
    setQuantity(1);
    setRequests('');
    setErrorMessage(null);
    setOrderConfirmation(null);
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] py-8 px-4 flex flex-col items-center">
      {/* 
        [전체 디자인 규칙]
        - 카페 느낌의 따뜻한 베이지 (#faf6f0), 브라운 (#6b4226)
        - 최대 너비 520px, 가운데 정렬
        - 둥근 모서리, 부드러운 그림자
      */}
      <main className="w-full max-w-[520px] mx-auto bg-white rounded-2xl shadow-md border border-[#ede3d8] p-6 sm:p-8 transition-all">
        
        {/* [페이지 상단: 로고, 카페 이름, 부제] */}
        <header className="text-center mb-6">
          <div className="text-5xl mb-2 select-none animate-bounce-subtle" role="img" aria-label="커피 로고">
            ☕
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#6b4226] tracking-tight">
            바이브 카페
          </h1>
          <p className="text-sm text-[#8d6e63] mt-1 font-medium">
            당신의 하루에 바이브를 더하다
          </p>

          {/* 서브 네비게이션 탭 (주문서 작성 / 게시판) */}
          <div className="flex items-center justify-center gap-1.5 mt-5 p-1 bg-[#f5ede2] rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('order')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'order'
                  ? 'bg-[#6b4226] text-white shadow-sm'
                  : 'text-[#6b4226] hover:bg-[#ebdcc9]'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              <span>주문서 작성</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'board'
                  ? 'bg-[#6b4226] text-white shadow-sm'
                  : 'text-[#6b4226] hover:bg-[#ebdcc9]'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>주문 내역 ({orderHistory.length})</span>
            </button>
          </div>
        </header>

        {/* 탭 1: 주문서 작성 폼 */}
        {activeTab === 'order' && (
          <form onSubmit={handleOrderSubmit} className="space-y-5">
            
            {/* 1. 이름 (필수, text) */}
            <div>
              <label 
                htmlFor="customer-name" 
                className="block text-sm font-semibold text-[#4a2e1b] mb-1.5"
              >
                1. 이름 <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                id="customer-name"
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="주문하시는 분의 성함을 입력하세요"
                className="cafe-input"
                required
              />
            </div>

            {/* 2. 전화번호 (tel) */}
            <div>
              <label 
                htmlFor="customer-phone" 
                className="block text-sm font-semibold text-[#4a2e1b] mb-1.5"
              >
                2. 전화번호
              </label>
              <input
                id="customer-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="예: 010-1234-5678 (주문 알림용)"
                className="cafe-input"
              />
            </div>

            {/* 3. 음료 선택 (드롭다운) */}
            <div>
              <label 
                htmlFor="drink-select" 
                className="block text-sm font-semibold text-[#4a2e1b] mb-1.5"
              >
                3. 음료 선택 <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                id="drink-select"
                value={selectedDrinkId}
                onChange={(e) => {
                  setSelectedDrinkId(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="cafe-input bg-white cursor-pointer"
                required
              >
                <option value="">-- 음료를 선택해주세요 --</option>
                {DRINK_LIST.map((drink) => (
                  <option key={drink.id} value={drink.id}>
                    {drink.name} {drink.price.toLocaleString()}원
                  </option>
                ))}
              </select>
              {selectedDrinkId && (
                <p className="text-xs text-[#8d6e63] mt-1 pl-1">
                  💡 {DRINK_LIST.find((d) => d.id === selectedDrinkId)?.description}
                </p>
              )}
            </div>

            {/* 4. 사이즈 (라디오 버튼, 가로 배치) */}
            <div>
              <span className="block text-sm font-semibold text-[#4a2e1b] mb-1.5">
                4. 사이즈 선택
              </span>
              <div className="flex flex-row flex-wrap items-center gap-3">
                {SIZE_LIST.map((size) => (
                  <label
                    key={size.id}
                    htmlFor={`size-${size.id}`}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm cursor-pointer transition-all ${
                      selectedSize === size.id
                        ? 'border-[#6b4226] bg-[#fbf5ee] text-[#6b4226] font-bold shadow-xs'
                        : 'border-[#e0d6cb] bg-white text-[#5d4037] hover:border-[#bcaaa4]'
                    }`}
                  >
                    <input
                      id={`size-${size.id}`}
                      type="radio"
                      name="cafe-size"
                      value={size.id}
                      checked={selectedSize === size.id}
                      onChange={() => setSelectedSize(size.id)}
                      className="accent-[#6b4226] w-4 h-4 cursor-pointer"
                    />
                    <span>{size.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. 추가 옵션 (체크박스, 가로 배치) */}
            <div>
              <span className="block text-sm font-semibold text-[#4a2e1b] mb-1.5">
                5. 추가 옵션 (중복 선택 가능)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {EXTRA_OPTIONS.map((opt) => {
                  const isChecked = selectedOptions.includes(opt.name);
                  return (
                    <label
                      key={opt.id}
                      htmlFor={`option-${opt.id}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#6b4226] bg-[#fbf5ee] text-[#6b4226] font-semibold'
                          : 'border-[#e0d6cb] bg-white text-[#5d4037] hover:border-[#bcaaa4]'
                      }`}
                    >
                      <input
                        id={`option-${opt.id}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleOptionToggle(opt.name)}
                        className="accent-[#6b4226] w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="truncate">{opt.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 6. 수량 (number 타입, 최소 1, 최대 10, 기본값 1) */}
            <div>
              <label 
                htmlFor="drink-quantity" 
                className="block text-sm font-semibold text-[#4a2e1b] mb-1.5"
              >
                6. 수량 (최소 1개, 최대 10개)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#d7ccc8] bg-[#fdfbf9] text-[#6b4226] hover:bg-[#f5ede2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="수량 감소"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  id="drink-quantity"
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
                  className="cafe-input text-center font-bold text-base max-w-[100px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#d7ccc8] bg-[#fdfbf9] text-[#6b4226] hover:bg-[#f5ede2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="수량 증가"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-xs text-[#8d6e63]">잔</span>
              </div>
            </div>

            {/* 7. 요청사항 (textarea) */}
            <div>
              <label 
                htmlFor="drink-requests" 
                className="block text-sm font-semibold text-[#4a2e1b] mb-1.5"
              >
                7. 요청사항
              </label>
              <textarea
                id="drink-requests"
                rows={3}
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
                placeholder="얼음 양, 농도 조절 등 바리스타에게 전달할 요청사항을 적어주세요."
                className="cafe-input resize-none"
              />
            </div>

            {/* 유효성 검사 에러 알림창 */}
            {errorMessage && (
              <div 
                role="alert" 
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg animate-fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 
              [예상 금액 표시 영역]
              - 주문하기 버튼 바로 위에 큰 글씨(24px), 갈색, 굵게, 가운데 정렬
              - 실시간으로 자동 계산됨
            */}
            <div className="pt-3 pb-1 text-center border-t border-[#ede3d8]">
              <p className="text-xs text-[#8d6e63] mb-1 font-medium">실시간 합계</p>
              <div className="text-[24px] font-bold text-[#6b4226] tracking-tight">
                예상 금액: {estimatedPrice.toLocaleString()}원
              </div>
              {selectedDrinkId && (
                <p className="text-xs text-[#a1887f] mt-1">
                  (단가 {(estimatedPrice / quantity).toLocaleString()}원 × {quantity}잔)
                </p>
              )}
            </div>

            {/* 8. 주문하기 버튼 & 9. 다시 작성 버튼 */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="submit"
                className="btn-order flex-1 py-3 px-4 rounded-lg font-bold text-base shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Coffee className="w-5 h-5" />
                <span>주문하기</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3 rounded-lg border border-[#d7ccc8] bg-[#fbf8f5] text-[#6b4226] font-medium text-sm hover:bg-[#f0e7dc] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="입력 내용 초기화"
              >
                <RotateCcw className="w-4 h-4" />
                <span>다시 작성</span>
              </button>
            </div>

            {/* 
              [주문 확인 메시지]
              - 연두색 배경, 초록 글씨, 둥근 모서리
              - 형식: "홍길동님, 카페라떼 M사이즈 (샷 추가) 1잔, 총 5,000원 주문이 접수되었습니다!"
            */}
            {orderConfirmation && (
              <section 
                id="confirmation-section"
                aria-live="polite"
                className="mt-5 p-4 bg-[#eaf7eb] border border-[#c4e6c7] rounded-xl text-[#1b6b2e] shadow-xs animate-fade-in"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#2e7d32] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm mb-1 text-[#1b6b2e]">
                      주문이 성공적으로 접수되었습니다!
                    </h4>
                    <p className="text-sm leading-relaxed font-medium">
                      {orderConfirmation}
                    </p>
                    <div className="mt-2 pt-2 border-t border-[#c4e6c7]/60 flex items-center justify-between text-xs text-[#2e7d32]">
                      <span>주문 상태: <strong>제조 대기중</strong></span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('board')}
                        className="underline hover:text-[#1b6b2e] font-semibold"
                      >
                        주문 게시판 보기 &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

          </form>
        )}

        {/* 탭 2: 주문 내역 게시판 */}
        {activeTab === 'board' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#ede3d8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#6b4226]">주문 접수 현황</h3>
                <p className="text-xs text-[#8d6e63]">실시간으로 접수된 바이브 카페 주문 목록입니다.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('order')}
                className="text-xs font-semibold text-[#6b4226] bg-[#f5ede2] hover:bg-[#e8dcce] px-2.5 py-1.5 rounded-lg transition-colors"
              >
                + 새 주문 작성
              </button>
            </div>

            {orderHistory.length === 0 ? (
              <div className="text-center py-10 text-[#8d6e63]">
                <Coffee className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">접수된 주문이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderHistory.map((order, idx) => (
                  <article 
                    key={order.id} 
                    className="p-3.5 rounded-xl border border-[#e8ded3] bg-[#fdfcfb] hover:border-[#6b4226] transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 bg-[#f5ede2] text-[#6b4226] rounded">
                          #{orderHistory.length - idx}
                        </span>
                        <h4 className="font-bold text-sm text-[#4a2e1b]">
                          {order.customerName}님
                        </h4>
                      </div>
                      <span className="text-xs text-[#8d6e63]">{order.createdAt}</span>
                    </div>

                    <div className="text-xs text-[#5d4037] space-y-0.5">
                      <p className="font-semibold text-sm text-[#6b4226]">
                        ☕ {order.drinkName} ({order.size}사이즈) × {order.quantity}잔
                      </p>
                      {order.selectedOptions.length > 0 && (
                        <p className="text-[#8d6e63]">
                          옵션: {order.selectedOptions.map(o => o.split(' +')[0]).join(', ')}
                        </p>
                      )}
                      {order.requests && (
                        <p className="text-[#8d6e63] italic">
                          요청사항: "{order.requests}"
                        </p>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#ede3d8] flex items-center justify-between">
                      <span className="text-xs text-[#8d6e63]">결제 예정액</span>
                      <span className="font-bold text-sm text-[#6b4226]">
                        {order.totalPrice.toLocaleString()}원
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 푸터 영역 */}
        <footer className="mt-8 pt-4 border-t border-[#f0e6da] text-center text-xs text-[#a1887f]">
          <p>© 2026 바이브 카페 (Vibe Cafe). 따뜻한 하루 되세요.</p>
        </footer>
      </main>
    </div>
  );
}

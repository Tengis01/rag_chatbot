# Use Case / User Flow Diagram

Хэрэглэгчийн бүх үндсэн үйлдэл ба тэдгээрийн урьдчилсан нөхцөлүүд. Вэб болон мобайл клиент ижил use case-уудыг дэмжинэ (онбординг зөвхөн мобайлд).

## Use cases

```mermaid
flowchart LR
    User(("👤 Хэрэглэгч"))

    subgraph AUTH["Нэвтрэлт"]
        UC1(["Бүртгүүлэх (имэйл + нууц үг)"])
        UC2(["Нэвтрэх / Гарах"])
        UC0(["Онбординг үзэх (зөвхөн мобайл)"])
    end

    subgraph DOCS["Баримтын удирдлага"]
        UC3(["PDF байршуулах (≤20MB)"])
        UC4(["Текст буулгах (≤500k тэмдэгт)"])
        UC5(["Боловсруулалтын төлөв харах (polling)"])
        UC6(["Чатад ашиглах баримт сонгох"])
    end

    subgraph CHAT["Чат"]
        UC7(["Асуулт асуух"])
        UC8(["Хайлтын тохиргоо өөрчлөх (MMR, threshold, λ)"])
        UC9(["Эх сурвалжийн ишлэл үзэх"])
        UC10(["Өмнөх харилцан яриаг үргэлжлүүлэх"])
    end

    User --- UC0
    User --- UC1
    User --- UC2
    User --- UC3
    User --- UC4
    User --- UC5
    User --- UC6
    User --- UC7
    User --- UC8
    User --- UC9
    User --- UC10

    UC7 -.->|"include: зөвхөн ready баримт"| UC6
    UC6 -.->|"include: status = ready"| UC5
    UC8 -.->|"extend"| UC7
    UC9 -.->|"хариулт бүрд дагалдана"| UC7
```

## Үндсэн урсгал (happy path)

```mermaid
flowchart TD
    Start(["Апп нээх"]) --> Mob{"Мобайл + анхны удаа?"}
    Mob -->|Тийм| Onb["Онбординг (4 слайд, алгасаж болно)"]
    Mob -->|Үгүй| Sess
    Onb --> Sess{"Session хүчинтэй юу?"}
    Sess -->|Үгүй| Login["Нэвтрэх / Бүртгүүлэх"]
    Sess -->|Тийм| WS["Ажлын талбар"]
    Login --> WS

    WS --> Add["Баримт нэмэх: PDF upload эсвэл paste"]
    Add --> Wait["Төлөв: pending → processing (3с polling)"]
    Wait -->|ready| Sel["Баримт автоматаар сонгогдоно"]
    Wait -->|failed| Err["error_message харуулна → дахин оролдох"]
    Err --> Add

    Sel --> Ask["Асуулт бичих (+ сонголтоор MMR/threshold/λ тохиргоо)"]
    Ask --> Reply["Хариулт + эх сурвалжийн картууд"]
    Reply -->|Үргэлжлүүлэн асуух| Ask
    Reply --> Hist["Түүх sidebar-т хадгалагдана — дараа үргэлжлүүлж болно"]
```

## Тэмдэглэл

- Бүх use case (онбордингоос бусад) нэвтэрсэн байхыг шаардана — `requireUser()` 401 буцаана.
- Баримт `ready` биш бол сонгогдохгүй; `/chat` нь ready биш баримттай хүсэлтийг 400-аар няцаана.
- Хайлтын тохиргооны анхдагч утгууд: `useMMR=true`, `threshold=0.1`, `lambda=0.5` (ERR-021 interim).

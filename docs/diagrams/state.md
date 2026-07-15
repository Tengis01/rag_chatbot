# State Diagrams

## 1. Document lifecycle

Баримтын төлөвийн машин. Код: `apps/api/src/modules/ingestion/pipeline.ts` (`updateDocumentStatus`, `setDocumentError`) + startup sweep (`index.ts`). Клиентүүд `pending`/`processing` төлөвтэй баримт байхад л 3с тутам `GET /documents/:id/status`-аар шалгана.

```mermaid
stateDiagram-v2
    [*] --> pending : POST /documents/upload | /paste<br/>(INSERT + шууд 201 хариу)
    pending --> processing : setImmediate → processDocument()
    processing --> ready : бүх chunk + embedding хадгалагдав<br/>(chunk_count бичигдэнэ)
    processing --> failed : pipeline алдаа<br/>(error_message бичигдэнэ)
    pending --> failed : API restart sweep<br/>(in-memory текст алдагдсан)
    processing --> failed : API restart sweep
    ready --> [*] : DELETE (chunks CASCADE устна)
    failed --> [*] : DELETE

    note right of ready
        Зөвхөн ready баримт чатад
        сонгогдоно — /chat бусдыг
        400-аар няцаана
    end note
```

- Schema-ийн CHECK нь түүхэн шалтгаанаар `'error'` утгыг бас зөвшөөрдөг ч код зөвхөн `failed` ашигладаг.
- `failed` төлөвийн шалтгаан `documents.error_message`-д хадгалагдаж хоёр UI-д харагдана (migration 003, ERR-027).

## 2. Mobile routing states

Expo Router-ийн эхлэлийн чиглүүлэлт. Код: `apps/mobile/app/index.tsx` (root loader) + `app/onboarding.tsx`. ERR-030-ийн дараах бодлого: **онбординг алгасах сонголт зөвхөн хүчинтэй session байх үед үйлчилнэ**; Onboarding-оос `/` руу буцах зам байхгүй тул boot loop боломжгүй.

```mermaid
stateDiagram-v2
    [*] --> Root : апп нээгдэв ("/")
    Root : Root loader (index.tsx)
    Root : api-base зэрэгцээ probe + getSession — 5с timeout

    Root --> Workspace : session ✓ ба алгасах ✓
    Root --> Onboarding : session ✓, алгасах ✗
    Root --> Onboarding : session ✗ (алгасах хүчингүй болсон)
    Root --> Login : API хүрэхгүй, алгасах ✓
    Root --> Onboarding : API хүрэхгүй, алгасах ✗

    Onboarding --> Workspace : "Эхлэх" (session ✓)
    Onboarding --> Login : "Эхлэх" (session ✗ / шалгаж чадсангүй)
    Login --> Workspace : нэвтрэлт амжилттай
    Workspace --> Login : гарах (session устна)

    note right of Onboarding
        "/" руу буцах шилжилт
        байхгүй — ERR-030 boot loop
        дахин үүсэх боломжгүй
    end note
```

# taoweblan17

## Tai lieu

- [Phan tich flow check dia chi SoftBank](./docs/softbank-address-check-flow.md)

## Demo clone flow

Mo trang voi query param `individualCode`:

- `/?individualCode=422sLcGAVUfqK`

Trang demo se cho test 4 buoc:

1. Search address
1.5. Chome -> Banchi/Go
2. Normalize
3. Detail
4. Availability (live, co retry live khi NTT temp error)

## Live-only den GOU (SB)

- Session guard lay that tu endpoint SB:
  - `POST /aqw-api/composition/individualCd/decision`
- Zipcode search lay that tu endpoint SB:
  - `GET /aqw-api/composition/search/address/{zip3}/{zip4}`

Luong dang chay:

1. `search/address` (live)
2. `detailAddressSearch requestKbn=1` -> banchi (live)
3. `detailAddressSearch requestKbn=2` -> gou (live)
4. `nttAddressSearch addressKbn=8/9/10` -> building/sub-building/room (live)
5. `nttAddressSearch` -> normalize (live-only)
6. `serviceAreaCheck` -> availability (live-only, retry live neu NTT temp error)

Chi tiet:

- `banchi` va `gou` lay live tu SB qua `detailAddressSearch`:
  - `requestKbn=1` -> `addressBanchiList`
  - `requestKbn=2` -> `addressGoList`
- Da map theo flow moi: `building -> sub-building -> room`.

## Ghi chu

- Ban nay da bo data source switch trong UI va chay live-only o cac buoc normalize/availability.
- Khi live endpoint loi/chan, he thong tra loi truc tiep (khong fallback `api/internal/*`).

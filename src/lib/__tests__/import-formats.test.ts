import { describe, it, expect } from 'vitest';
import { parseOfx } from '../import/ofx';
import { parseCamt053 } from '../import/camt053';
import { parseMt940 } from '../import/mt940';
import { dedupKey } from '../import/dedup-key';

describe('import/ofx', () => {
  it('разбирает STMTTRN из OFX', () => {
    const ofx = `<OFX><CURDEF>RUB
      <STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20260601120000<TRNAMT>-1500.50<NAME>Пятёрочка<MEMO>Покупка</STMTTRN>
      <STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20260603<TRNAMT>50000.00<NAME>Зарплата</STMTTRN>
    </OFX>`;
    const res = parseOfx(ofx, 'RUB');
    expect(res.rows).toHaveLength(2);
    expect(res.rows[0]).toMatchObject({ occurredAt: '2026-06-01', amountOriginal: -150050, direction: 'expense', currencyOriginal: 'RUB' });
    expect(res.rows[1]).toMatchObject({ occurredAt: '2026-06-03', amountOriginal: 5000000, direction: 'income' });
  });
});

describe('import/camt053', () => {
  it('разбирает Ntry из CAMT.053', () => {
    const xml = `<Document><BkToCstmrStmt><Stmt>
      <Ntry><Amt Ccy="EUR">120.00</Amt><CdtDbtInd>DBIT</CdtDbtInd><BookgDt><Dt>2026-06-05</Dt></BookgDt><NtryDtls><TxDtls><RmtInf><Ustrd>Hosting</Ustrd></RmtInf></TxDtls></NtryDtls></Ntry>
      <Ntry><Amt Ccy="EUR">3000.00</Amt><CdtDbtInd>CRDT</CdtDbtInd><BookgDt><Dt>2026-06-10</Dt></BookgDt></Ntry>
    </Stmt></BkToCstmrStmt></Document>`;
    const res = parseCamt053(xml, 'RUB');
    expect(res.rows).toHaveLength(2);
    expect(res.rows[0]).toMatchObject({ occurredAt: '2026-06-05', amountOriginal: -12000, direction: 'expense', currencyOriginal: 'EUR', description: 'Hosting' });
    expect(res.rows[1]).toMatchObject({ direction: 'income', amountOriginal: 300000 });
  });
});

describe('import/mt940', () => {
  it('разбирает :61:/:86: из MT940', () => {
    const mt = [':20:HOLDY', ':60F:C260101RUB0,00', ':61:2606010601D1500,50NTRFNONREF', ':86:Пятёрочка Москва', ':61:2606030603C50000,00NTRFNONREF', ':86:Зарплата'].join('\n');
    const res = parseMt940(mt, 'RUB');
    expect(res.rows).toHaveLength(2);
    expect(res.rows[0]).toMatchObject({ occurredAt: '2026-06-01', amountOriginal: -150050, direction: 'expense' });
    expect(res.rows[0].description).toContain('Пятёрочка');
    expect(res.rows[1]).toMatchObject({ direction: 'income', amountOriginal: 5000000 });
  });
});

describe('import/dedup-key', () => {
  it('одинаковые операции дают одинаковый ключ', () => {
    const a = dedupKey({ accountId: '', occurredAt: '2026-06-01', amountOriginal: -150050, currency: 'RUB', normalizedDescription: 'Пятёрочка  Москва' });
    const b = dedupKey({ accountId: '', occurredAt: '2026-06-01', amountOriginal: -150050, currency: 'RUB', normalizedDescription: 'пятёрочка москва' });
    expect(a).toBe(b);
  });
});

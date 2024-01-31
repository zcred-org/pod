export interface ICredential {
  id: string;
  title: string;
  fio?: string;
  issuedAt?: Date;
  No?: string;
  country?: string;
  presentedAt?: {
    site: string;
    date: Date;
  }[];
}

export const CredentialsMocked: ICredential[] = [{
  id: '1',
  title: 'KYC Passport',
  issuedAt: new Date('2023-12-12'),
  No: '76 277 323',
  fio: 'John Doe',
  country: 'ru',
  presentedAt: [{
    site: 'defi.com',
    date: new Date('2023-12-14'),
  }, {
    site: 'rwa.com',
    date: new Date('2023-12-14'),
  }],
}, {
  id: '2',
  title: 'zCongress Ticket',
}, {
  id: '3',
  title: 'Email @brex.com',
}];
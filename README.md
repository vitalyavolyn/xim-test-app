# test assignment

```bash
git clone https://github.com/vitalyavolyn/xim-test-app.git
cd xim-test-app
yarn
yarn prisma generate
```

Edit `.env` file and add your own values for `DATABASE_URL`, `JWT_SECRET` and `REFRESH_JWT_SECRET`.

Apply database migrations:

```bash
yarn prisma db push
```

Run: `yarn start`

Build: `yarn build`

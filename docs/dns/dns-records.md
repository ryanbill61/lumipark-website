# 三站 DNS / 邮件记录（截至 2026-09-19）

## 1. Resend 发信域名（三站均已 Verified）

### lumiparkgroup.com（Resend）
- TXT `resend._domainkey` = `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDYjZ3zf4dw97Xhou0RVPW8CegJJYZ+tFBzb/yej2gOvsMLqEB0LnvI3a1KCXbnMyHzDgdc5tDjK8J3haL1RCzSgEF6T3BDpd3hztCzoUnGeW9f5cdb6fQco1bO9IL/QDVj1HF0Nkv1c9Z6BW6QxGyIaXu+xpcpCqPdh8l0xc9YmwIDAQAB`
- CNAME `rsend` = `rsend.forge.rmta.net`
- CNAME `send` = `send.forge.rmta.net`
- TXT `_dmarc` = `v=DMARC1; p=none;`

### bmclighting.com（Resend）
- 同结构，DKIM 公钥是**另一串**（去 Resend Domains 页复制，别用 lumiparkgroup 的）

### leappon.com（Resend）
- 同结构（hello/ryan@leappon.com 发信用）

## 2. 收信 MX（品牌邮箱）

### lumiparkgroup.com
- MX `mx1.privateemail.com` 优先级 10
- MX `mx2.privateemail.com` 优先级 10
- SPF `v=spf1 include:spf.privateemail.com ~all`

### bmclighting.com
- 同上（MX privateemail + SPF privateemail）
- 保留 TXT `hosting-site=bmc-lighting-na` 别删

### leappon.com（阿里企业邮箱，域名 DNS 在 Cloudflare）
- MX `mx1.qiye.aliyun.com` 优先级 5
- MX `mx2.qiye.aliyun.com` 优先级 10
- MX `mx3.qiye.aliyun.com` 优先级 15
- SPF `v=spf1 include:spf.qiye.aliyun.com ~all`
- DKIM（可选）`default._domainkey` TXT，值 `v=DKIM1; k=rsa; p=...`（走 Resend 发信可暂不加）

## 3. 品牌邮箱（2026-09-19 起）
- 母舰 = `ryan@lumiparkgroup.com`（Namecheap Private Email）
- BMC = `monica@bmclighting.com`（Namecheap Private Email）
- LEAPPON = `ryan@leappon.com`（阿里企业邮箱；旧 lucas@leappon-energy.com 已退役）

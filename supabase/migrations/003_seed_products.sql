-- ========================================================================
-- 003 — 상품 시드 (Phase 1 mock 의 20개 상품을 DB 로 이전)
-- ========================================================================
-- 멱등: ON CONFLICT (slug) DO NOTHING. 두 번 돌려도 중복 입력 안 됨.
-- categories 의 slug 는 002 에서 INSERT 된 8개와 1:1 매칭된다.
-- ========================================================================

with new_products(slug, category_slug, name, description, base_price, display_order, options) as (
  values
    -- 명함 (3)
    ('basic-business-card', 'business-card', '일반 명함',
     '스노우 250g, 단면 컬러 인쇄. 가성비 좋은 기본 명함.', 8000, 1,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"200매","price_delta":0},{"label":"500매","price_delta":4000},{"label":"1000매","price_delta":9000}]},
       {"name":"코팅","display_order":2,"is_required":true,"values":[{"label":"무광","price_delta":0},{"label":"유광","price_delta":1500}]}
     ]'::jsonb),

    ('premium-business-card', 'business-card', '고급 명함',
     '아트지 300g, 양각·박 가공 가능. 임원·VIP용.', 18000, 2,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"200매","price_delta":0},{"label":"500매","price_delta":8000},{"label":"1000매","price_delta":18000}]},
       {"name":"후가공","display_order":2,"is_required":true,"values":[{"label":"없음","price_delta":0},{"label":"박 가공","price_delta":5000},{"label":"양각","price_delta":4000}]}
     ]'::jsonb),

    ('double-sided-business-card', 'business-card', '양면 명함',
     '앞·뒷면 모두 컬러 인쇄. 정보량이 많은 명함에 적합.', 12000, 3,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"200매","price_delta":0},{"label":"500매","price_delta":5000},{"label":"1000매","price_delta":11000}]}
     ]'::jsonb),

    -- 스티커 (3)
    ('circle-sticker', 'sticker', '원형 스티커',
     '원형 컷팅, 아트지·합성지 선택 가능.', 5000, 1,
     '[
       {"name":"사이즈","display_order":1,"is_required":true,"values":[{"label":"소 (3x3cm)","price_delta":0},{"label":"중 (5x5cm)","price_delta":2000},{"label":"대 (7x7cm)","price_delta":4500}]},
       {"name":"수량","display_order":2,"is_required":true,"values":[{"label":"100매","price_delta":0},{"label":"500매","price_delta":4000},{"label":"1000매","price_delta":9000}]}
     ]'::jsonb),

    ('square-sticker', 'sticker', '사각 스티커',
     '직사각·정사각 컷팅. 라벨 용도로 인기.', 5500, 2,
     '[
       {"name":"사이즈","display_order":1,"is_required":true,"values":[{"label":"5x5cm","price_delta":0},{"label":"7x10cm","price_delta":3500}]},
       {"name":"수량","display_order":2,"is_required":true,"values":[{"label":"100매","price_delta":0},{"label":"500매","price_delta":4500}]}
     ]'::jsonb),

    ('die-cut-sticker', 'sticker', '도무송 스티커',
     '디자인 윤곽 그대로 컷팅. 캐릭터·로고 굿즈에 적합.', 12000, 3,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"100매","price_delta":0},{"label":"300매","price_delta":8000},{"label":"500매","price_delta":14000}]}
     ]'::jsonb),

    -- 쿠폰 (2)
    ('basic-coupon', 'coupon', '일반 쿠폰',
     '한 장씩 분리되는 일반 컷팅 쿠폰.', 30000, 1,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"1000매","price_delta":0},{"label":"2000매","price_delta":18000},{"label":"5000매","price_delta":50000}]}
     ]'::jsonb),

    ('scissor-cut-coupon', 'coupon', '가위컷 쿠폰',
     '절취선 가공으로 매장에서 한 장씩 떼서 사용 가능.', 45000, 2,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"1000매","price_delta":0},{"label":"3000매","price_delta":30000}]}
     ]'::jsonb),

    -- 전단지 (3)
    ('flyer-a4', 'flyer', 'A4 전단지',
     '210x297mm, 스노우 100g 양면 컬러.', 25000, 1,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"1000매","price_delta":0},{"label":"3000매","price_delta":35000},{"label":"5000매","price_delta":55000}]},
       {"name":"용지","display_order":2,"is_required":true,"values":[{"label":"스노우 100g","price_delta":0},{"label":"아트지 120g","price_delta":6000}]}
     ]'::jsonb),

    ('flyer-a5', 'flyer', 'A5 전단지',
     '148x210mm, 컴팩트한 사이즈로 배포에 적합.', 18000, 2,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"1000매","price_delta":0},{"label":"3000매","price_delta":22000},{"label":"5000매","price_delta":38000}]}
     ]'::jsonb),

    ('flyer-b5', 'flyer', 'B5 전단지',
     '182x257mm, A4와 A5 사이의 중간 사이즈.', 22000, 3,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"1000매","price_delta":0},{"label":"3000매","price_delta":28000}]}
     ]'::jsonb),

    -- 포스터 (2)
    ('poster-a2', 'poster', 'A2 포스터',
     '420x594mm, 매장·게시판용.', 12000, 1,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"10매","price_delta":0},{"label":"50매","price_delta":35000},{"label":"100매","price_delta":60000}]}
     ]'::jsonb),

    ('poster-a1', 'poster', 'A1 포스터',
     '594x841mm, 대형 광고·전시용.', 22000, 2,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"10매","price_delta":0},{"label":"30매","price_delta":40000},{"label":"50매","price_delta":70000}]}
     ]'::jsonb),

    -- 미니배너 (2)
    ('mini-x-banner', 'mini-banner', '미니 X배너',
     '탁상용 X형 배너, 거치대 포함.', 9000, 1,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"1개","price_delta":0},{"label":"5개","price_delta":32000},{"label":"10개","price_delta":60000}]}
     ]'::jsonb),

    ('mini-stand-banner', 'mini-banner', '미니 거치형 배너',
     'L자형 거치대, 메뉴판·POP 광고에 적합.', 14000, 2,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"1개","price_delta":0},{"label":"5개","price_delta":50000}]}
     ]'::jsonb),

    -- 배너 (3)
    ('outdoor-banner', 'banner', '실외 현수막',
     '방수 원단, 옥외 광고용.', 30000, 1,
     '[
       {"name":"사이즈","display_order":1,"is_required":true,"values":[{"label":"5m x 0.7m","price_delta":0},{"label":"10m x 0.9m","price_delta":25000}]},
       {"name":"수량","display_order":2,"is_required":true,"values":[{"label":"1개","price_delta":0},{"label":"3개","price_delta":50000}]}
     ]'::jsonb),

    ('x-banner', 'banner', 'X배너',
     'X형 거치대 포함, 600x1800mm.', 25000, 2,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"1개","price_delta":0},{"label":"5개","price_delta":90000}]}
     ]'::jsonb),

    ('roll-banner', 'banner', '롤배너',
     '이동·보관 편리한 롤업 배너, 800x2000mm.', 55000, 3,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"1개","price_delta":0},{"label":"3개","price_delta":130000}]}
     ]'::jsonb),

    -- 어깨띠 (2)
    ('event-sash', 'sash', '행사용 어깨띠',
     '졸업·시상식·이벤트용 표준 어깨띠.', 13000, 1,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"1개","price_delta":0},{"label":"10개","price_delta":90000},{"label":"30개","price_delta":240000}]}
     ]'::jsonb),

    ('promo-sash', 'sash', '광고용 어깨띠',
     '선거·홍보 활동용, 두꺼운 원단.', 16000, 2,
     '[
       {"name":"수량","display_order":1,"is_required":true,"values":[{"label":"1개","price_delta":0},{"label":"10개","price_delta":110000}]}
     ]'::jsonb)
)
insert into public.products (slug, category_id, name, description, base_price, display_order, options, images, is_active)
select np.slug, c.id, np.name, np.description, np.base_price, np.display_order, np.options, '[]'::jsonb, true
from new_products np
join public.categories c on c.slug = np.category_slug
on conflict (slug) do nothing;

-- ========================================================================
-- 검증 쿼리 (적용 후 SQL Editor 에서 따로 돌려보면 좋음):
--
--   select count(*) from public.products;                  -- 20 기대
--   select c.slug, c.display_order, count(p.id) as products
--     from public.categories c
--     left join public.products p on p.category_id = c.id
--     group by c.slug, c.display_order
--     order by c.display_order;
-- ========================================================================

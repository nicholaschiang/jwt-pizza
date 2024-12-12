import { sleep, check, group, fail } from 'k6'
import http from 'k6/http'

export const options = {
  cloud: {
    distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 20, duration: '10s' },
        { target: 20, duration: '30s' },
        { target: 0, duration: '10s' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
  },
}

export function scenario_1() {
  const vars = {};

  let response

  group('page_2 - https://pizza.nicholas.engineering/register', function () {
    response = http.get('https://pizza.nicholas.engineering/register', {
      headers: {
        Host: 'pizza.nicholas.engineering',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'If-Modified-Since': 'Thu, 20 Jun 2024 17:26:43 GMT',
        Priority: 'u=0, i',
        TE: 'trailers',
      },
    })
    sleep(12.7)

    response = http.post('https://pizza-service.nicholas.engineering/api/auth', '{}', {
      headers: {
        Host: 'pizza-service.nicholas.engineering',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        Origin: 'https://pizza.nicholas.engineering',
        DNT: '1',
        Connection: 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        Priority: 'u=0',
        TE: 'trailers',
      },
    })
    if (!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
      console.log(response.body)
      fail("Login was *not* 200")
    } else {
      vars.authToken = response.json().token
    }

    response = http.options('https://pizza-service.nicholas.engineering/api/auth', null, {
      headers: {
        Host: 'pizza-service.nicholas.engineering',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
        Origin: 'https://pizza.nicholas.engineering',
        DNT: '1',
        Connection: 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        Priority: 'u=4',
        TE: 'trailers',
      },
    })
    sleep(3.4)

    response = http.get('https://pizza-service.nicholas.engineering/api/order/menu', {
      headers: {
        Host: 'pizza-service.nicholas.engineering',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vars.authToken}`,
        Origin: 'https://pizza.nicholas.engineering',
        DNT: '1',
        Connection: 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'If-None-Match': 'W/"2b9-zmwuo2jVJjZPwJm0lavLUHQQdYk"',
        Priority: 'u=0',
        TE: 'trailers',
      },
    })

    response = http.options('https://pizza-service.nicholas.engineering/api/order/menu', null, {
      headers: {
        Host: 'pizza-service.nicholas.engineering',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type',
        Origin: 'https://pizza.nicholas.engineering',
        DNT: '1',
        Connection: 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        Priority: 'u=4',
        TE: 'trailers',
      },
    })

    response = http.get('https://pizza-service.nicholas.engineering/api/franchise', {
      headers: {
        Host: 'pizza-service.nicholas.engineering',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vars.authToken}`,
        Origin: 'https://pizza.nicholas.engineering',
        DNT: '1',
        Connection: 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'If-None-Match': 'W/"1a1-eLnk8G6YAEHgZ8nHT2KdEeflqcg"',
        Priority: 'u=4',
        TE: 'trailers',
      },
    })

    response = http.options('https://pizza-service.nicholas.engineering/api/franchise', null, {
      headers: {
        Host: 'pizza-service.nicholas.engineering',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type',
        Origin: 'https://pizza.nicholas.engineering',
        DNT: '1',
        Connection: 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        Priority: 'u=4',
        TE: 'trailers',
      },
    })
    sleep(11.3)

    response = http.post('https://pizza-service.nicholas.engineering/api/order', '{}', {
      headers: {
        Host: 'pizza-service.nicholas.engineering',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vars.authToken}`,
        Origin: 'https://pizza.nicholas.engineering',
        DNT: '1',
        Connection: 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        Priority: 'u=0',
        TE: 'trailers',
      },
    })

    response = http.options('https://pizza-service.nicholas.engineering/api/order', null, {
      headers: {
        Host: 'pizza-service.nicholas.engineering',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type',
        Origin: 'https://pizza.nicholas.engineering',
        DNT: '1',
        Connection: 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        Priority: 'u=4',
        TE: 'trailers',
      },
    })
    sleep(238.7)

    response = http.post('https://pizza-factory.cs329.click/api/order/verify', '{}', {
      headers: {
        Host: 'pizza-factory.cs329.click',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vars.authToken}`,
        Origin: 'https://pizza.nicholas.engineering',
        DNT: '1',
        Connection: 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        Priority: 'u=0',
        TE: 'trailers',
      },
    })

    response = http.options('https://pizza-factory.cs329.click/api/order/verify', null, {
      headers: {
        Host: 'pizza-factory.cs329.click',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type',
        Origin: 'https://pizza.nicholas.engineering',
        DNT: '1',
        Connection: 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        Priority: 'u=4',
      },
    })
  })
}

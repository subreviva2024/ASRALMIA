# CJ Dropshipping API - Complete Documentation
> Source: https://developers.cjdropshipping.cn/en/api/start/
> Compiled: 2026-02-26

---

## Table of Contents

1. [Introduction](#introduction)
2. [Development](#development)
3. [Get Access-token](#get-access-token)
4. [Practical Tool](#practical-tool)
5. [Orders Synchronization Processing](#orders-synchronization-processing)
6. [Products Synchronization Processing](#products-synchronization-processing)
7. [Webhook](#webhook)
8. [Sandbox](#sandbox)
9. [Interface Definition](#interface-definition)
10. [Interface Field Definition](#interface-field-definition)
11. [Interface Call Restrictions](#interface-call-restrictions)
12. [Appendix 1 - Global Error Codes](#appendix-1---global-error-codes)
13. [Appendix 2 - Country Code](#appendix-2---country-code)
14. [Appendix 3 - Platforms](#appendix-3---platforms)
15. [API 1 - Authentication](#api-1---authentication)
16. [API 2 - Setting](#api-2---setting)
17. [API 3 - Product](#api-3---product)
18. [API 4 - Storage](#api-4---storage)
19. [API 5 - Shopping](#api-5---shopping)
20. [API 6 - Logistic](#api-6---logistic)
21. [API 7 - Dispute](#api-7---dispute)
22. [API 8 - Webhook](#api-8---webhook)

---



---

# Introduction


# #Introduction

CJ API enables developers to access CJ system.

## #Update Announcements

| Update Time | Update Content | STATUS | JUMP URL |
| --- | --- | --- | --- |
| 2025-11-18 | 【Warehouse Management】Add a new interface "Get Storage Info". | New Interface | View Details |
| 2025-11-19 | 【Inventory Query Enhancement】The "Query Inventory by Product ID" interface adds a new returned field: Sub-warehouse List, supporting queries for the detailed inventory distribution of products across all sub-warehouses. | Function Enhancement | View Details |
| 2025-12-02 | 【Logistics Process】Add complete documentation for the "Platform Logistics Order Processing", detailing the full-process status flow from order placement to receipt. | Documentation Added | View Details |


---

# Development


# #Development Documentation
- Introduction
- Call Flow
- Debugging Methods
- Rate Limits

## #Introduction

The CJ API offers a rich set of capability interfaces that developers can use to achieve integration of enterprise
services and enterprise WeChat with the help of interface capabilities which can be quickly previewed by directory navigation.
The navigation is aggregated and grouped by functional blocks, such as address book, push, etc..

For the API development, the guideline is Development Documentation > Get Access Token > API 2.0.

All interfaces must use the HTTPS protocol, JSON data format and UTF8 encoding. The interface description format is as follows.

```
Request method: 
POST (HTTPS)
Request address: 
...
Request package body.
...
Parameter description.
...
Permission Description.
...
Return results.
...
Description of parameters.
...

```
- The request method. All requests shall meet the https protocol, distinguishing HttpGet and HttpPost requests.
- The request address. Case matters.
- The request package body and parameter description. You should indicates the request parameter example and description,
which includes field meanings and value ranges. You should refer to this definition scope when designing data structures.
- The permission description. You should indicate the use range of the interface. By default, it can only view the data under
the current account. No invocation scenario need your special attention.
- The return results and description of parameters. You should indicates the request parameter example and description.Important: To determine if an API call was successful:Success: HTTP status 200 AND (code=200 OR no code field present)Failure: HTTP status ≠ 200 OR code field present with value ≠ 200
Please refer to the global error code documentation for specific error meanings.

The message is for reference only and is subject to change, so it cannot be used to determine whether the call was successful.

## #Interface call flow

Find the access token. Reference:documentation note.
- Cache and refresh access_token.
- You need to cache the access_token for subsequent calls to the interface. When the access_token is invalid or expired, it needs to be retrieved.
- Calling a specific business interface.

## #Basic debugging methods

Tools, such as postman, can be used to troubleshoot problems. Reference:documentation note

## #Limitations on the frequency of calls

To ensure our platform remains stable and fair for everyone, all APIs are rate-limited. Reference:Active call frequency limit


---

# Get Access-token


# #Get Token

## #Token Mechanism

Tokens can be obtained upon Auth2.0 protocol. Each Access Token and Refresh Token has its timestamp.

## #Get Access_token

> For security reasons, the Access Token shall always be stored in the backend, and shall never be returned to front end,
as all API access requests shall be initiated from backend.

Access Token must be obtained to create a login credential before calling API interface, as caller ID of other API interfaces
will be  authenticated with Access Token.

CJ-Access-Token:Get CJ-Access-Token

## #Storage & Examination of Token

### #Access Token

An Access Token which contains login information must be created before API can be called. Access Tokens are required
before servers can be accessed. In general, the life of an Access Token is 15 days.

### #Refresh Token

An Access Token can be refreshed with a Refresh Token. Access Tokens will be returned after Refresh Tokens are imported
to the authentication server. In general, the life of a Refresh Token is 180 days.

Regular examination on validity of Tokens is recommended:
Examination of expiry date of each Token before use: if Access_Token is expired, Refresh_Token can be applied to refresh.

## #Token Refresh

Get new Access Token and Refresh Token when expiry date of Access Token is near, and store new tokens as before.  Delay
queue is recommended when refreshing tokens.

## #Reauthorization

If both Access Token and Refresh Token are expired, new tokens can be obtained via reauthorization.


---

# Practical Tool


# #Practical Tool

## #Postman API Application Example

### #Postman Introduction

Postman is an API development tool which helps to build, test and modify APIs.

Download：postman(opens new window)

### #Postman API Interface

#### #Procedure
- Check CJ Docs to get interface.
- Set environment variables.
- Interface call.

#### #Environment Setup

Postman Environments Setup in Postman Environments

| Environment Variable | Description | Note |
| --- | --- | --- |
| host | Domain Name | https://developers.cjdropshipping.com |
| token | For Authentication |  |
| email | Email | Required for Login |
| password | Password | Required for Login |

#### #Example


---

# Orders Synchronization Processing


# #Orders Synchronization Processing

This document introduces two main processes for synchronizing orders to the CJ platform through the API:

## #1. Platform Waybill Order Processing
- Query Inventory by Product ID.Docs：Query Inventory by Product ID
- Query Warehouse Information.Docs：Query Warehouse Information
- Create Order.Docs：Create Order V2orCreate Order V3

> Tip:Added parameters: shopLogisticsType and storageIdLogistics type and storage ID need to be specified (storage ID once specified, cannot be changed)
- Add Orders to Cart.Docs：Add Orders to Cart

> Tip: Batch add orders to the shopping cart, support adding orders.
- Confirm Add CartDocs：Confirm Add Cart
- Generate parent order and Obtain Payment ID.Docs：Generate parent order and Obtain Payment ID
- Payment.Docs：Payment

> Tip: You can also make bulk payments through MyCJ's website
- Upload Waybill and Shipping Information.Docs：Upload Waybill and Shipping Information

> Tip: It can only be executed after the payment is completed
- Update Waybill and Shipping Information.Docs：Update Waybill and Shipping Information

## #2. The process of synchronizing orders and utilizing CJ Logistics
- Create Order.Docs：Create Order V2orCreate Order V3

> Tip:Please set the value of shopLogisticsType to 2 and leave the value of storageId emptyLogistics needs to be specified, parameter: logisticName
- Add Orders to Cart.Docs：Add Orders to Cart.
- Confirm Adding CartDocs：Confirm Adding Cart
- Generate parent order and Obtain Payment ID.Docs：Generate parent order and Obtain Payment ID
- Payment Or You can also make bulk payments through MyCJ's websiteDocs:Payment(opens new window)
- Waiting for CJ delivery
- Obtain order detailsDocs:Obtain order details
- Query logistics trackDocs：Query logistics track


---

# Products Synchronization Processing


# #Products Synchronization Processing

This guide outlines the process of syncing products from CJ to your platform using the CJ API.

## #Core Flowchart

```
graph LR
    A[Auth: Get Token] --> B["Sync Categories (Optional)"]
    B --> C[Get Product List]
    C --> D[Get Product Details]
    D --> E["Get Variants (Optional)"]
    E --> F[Query Real-time Inventory]

```

## #Detailed Steps

### #1. Authentication

Purpose:Obtain an access token to authorize subsequent API requests.API:Get Access Token

### #2. Sync Categories (Optional)

Purpose:Get category information to map CJ categories to your platform. This helps in organizing products correctly on your site.API:Category List

### #3. Get Product List

Purpose:Retrieve a list of products available for dropshipping. You can filter by category or other parameters.API:Product List v2

### #4. Get Product Details

Purpose:Fetch detailed information for a specific product, including descriptions, images, and basic variant info.API:Product Details

### #5. Get Variants (Optional)

Purpose:If the product details API does not provide sufficient variant information, use this API to query all variants specifically.API:Inquiry of All Variants

### #6. Query Real-time Inventory

Purpose:Check stock levels before listing the product on your platform to ensure availability.API:Query Inventory by Product ID


---

# Webhook


# #Webhook Mechanism

## #Introduction

Product details including addition, deletion & modification of variants.

## #Setup Procedure
- 1）Set up message monitoring and reference.webhook
- 2）Set up client monitoring interface, example as below(Java).
- 3）Test monitoring.

### #Webhook Configuration Requirements

#### #1. Protocol Requirements
- Supported Protocols: HTTPS
- Encryption: TLS 1.2 or TLS 1.3 recommended for secure transmission
- Request Method: POST
- Content Type:Content-Type: application/json

#### #2. Response Specifications
- Success Status Code:200 OK
- Timeout: Response must be returned within3 seconds(Avoid long-running or complex business logic to ensure prompt response)

## #List of topics

### #Product Message:PRODUCT

#### #Occurs when a product is created or updated.
- Sample Payload

```
{
    "messageId": "ca72a4834cd14b9588e88ce206f614a0",
    "type": "PRODUCT",
    "messageType": "UPDATE",
    "params": {
        "categoryId": null,
        "categoryName": null,
        "pid": "1424608189734850560",
        "productDescription": "xxxxxx",
        "productImage": null,
        "productName": null,
        "productNameEn": null,
        "productProperty1": null,
        "productProperty2": null,
        "productProperty3": null,
        "productSellPrice": null,
        "productSku": null,
        "productStatus": null,
        "fields" : [
            "productDescription"
        ]
    }
}

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| messageId | Message Id | string | Y | 200 | Message Id |
| type | Data Type | string | Y | 20 | PRODUCT |
| messageType | Message type | string | Y | 15 | INSERT、UPDATE、DELETE |
| params |  | object | Y | 5 |  |
| - categoryId | category Id | string | Y | 200 |  |
| - categoryName | category Name | string | Y | 200 |  |
| - pid | product id | string | Y | 200 |  |
| - productDescription | product description | string | Y | 2000 |  |
| - productImage | product image | string | Y | 200 |  |
| - productName | product name | string | Y | 200 |  |
| - productNameEn | product name(english) | string | Y | 200 |  |
| - productProperty1 | product property | string | Y | 200 |  |
| - productProperty2 | product property | string | Y | 200 |  |
| - productProperty3 | product property | string | Y | 200 |  |
| - productSellPrice | product sell price | double | Y | 20 |  |
| - productSku | product sku | string | Y | 200 |  |
| - productStatus | product status | int | Y | 5 | status:2-Off sale, 3-On Sale |
| - fields | fields list | list | Y | 5 |  |

Product Status

| ProductStatus | Description |
| --- | --- |
| 2 | Off sale |
| 3 | On Sale |

#### #Inbound message for Variant

```
{
    "messageId": "7cceede817dc47ed9748328b64353c5c",
    "type": "VARIANT",
    "messageType": "UPDATE",
    "params": {
        "vid": "1424608152007086080",
        "variantName": null,
        "variantWeight": null,
        "variantLength": null,
        "variantWidth": null,
        "variantHeight": null,
        "variantImage": null,
        "variantSku": null,
        "variantKey": null,
        "variantSellPrice": null,
        "variantStatus": null,
        "variantValue1": null,
        "variantValue2": null,
        "variantValue3": null,
        "fields" : [
            "variantLength"
        ],
    }
}

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| messageId | Message id | string | Y | 50 | Message Id |
| type | Data Type | string | Y | 20 | VARIANT |
| messageType | Message Type | string | Y | 15 | INSERT、UPDATE、DELETE |
| params |  | object | Y |  |  |
| - vid | variant Id | string | Y | 50 |  |
| - variantName | variant name | string | Y | 200 |  |
| - variantWeight | variant weight, unit:g | int | Y |  |  |
| - variantLength | variant length, unit:mm | int | Y |  |  |
| - variantWidth | variant width, unit:mm | int | Y |  |  |
| - variantHeight | variant height, unit:mm | int | Y |  |  |
| - variantImage | variant image | string | Y | 200 |  |
| - variantSku | variant sku | string | Y | 200 |  |
| - variantKey | variant key | string | Y | 200 |  |
| - variantSellPrice | variant sell price, USD | double | Y |  |  |
| - variantStatus | variant status | int | Y | 5 |  |
| - variantValue1 | variant value1 | string | Y | 100 |  |
| - variantValue2 | variant value2 | string | Y | 100 |  |
| - variantValue3 | variant value3 | string | Y | 100 |  |
| - fields | fields list | list | Y | 5 |  |

Variant Status

| variantStatus | Description |
| --- | --- |
| 0 | Off sale |
| 1 | On sale |

### #Stock Message

```
{
    "messageId": "ca72a4834cd14b9588e88ce206f614a0",
    "type": "STOCK",
    "messageType": "UPDATE",
    "params": {
        "1424608152007086080": [
            {
                "vid": "1424608152007086080",
                "areaId": "2",
                "areaEn": "US Warehouse",
                "countryCode": "US",
                "storageNum": 12
            }
        ],
        "AE7DB9BC-4290-4C85-B8A6-F8957F3DB053": [
            {
                "vid": "AE7DB9BC-4290-4C85-B8A6-F8957F3DB053",
                "areaId": "2",
                "areaEn": "US Warehouse",
                "countryCode": "US",
                "storageNum": 1
            }
        ]
    }
}

```

### #Order message

```
{
    "messageId": "7cceede817dc47ed9748328b64353c5c",
    "type": "ORDER",
    "messageType": "UPDATE",
    "params": {
        "orderNumber": "api_52f268d40b8d460e82c0683955e63cc9",
        "cjOrderId": 210823100016290555,
        "orderStatus": "CREATED",
        "logisticName": "CJPacket Ordinary",
        "trackNumber": null,
        "createDate": "2021-08-23 11:31:45",
        "updateDate": "2021-08-23 11:31:45",
        "payDate": null,
        "deliveryDate": null,
        "completeDate": null,
        "orderItems": [
            "vid": "1392053744945991680",
			"quantity": 1,
			"sellPrice": 0.57,
            "lineItemId": "2505170958390976500",
            "storeLineItemId": "16045188153625",
            "productionOrderStatus": 1,
            "abnormalType": [
                6,
                9
            ]
        ]
    }
}

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| messageId | Message id | string | Y | 50 | Message Id |
| type | Data Type | string | Y | 20 | ORDER |
| messageType | Message Type | string | Y | 15 | INSERT、UPDATE、DELETE、ORDER_CONNNECTED: This type requires special attention：The product has been re-associated in the CJ system, and the order status has been updated from incomplete to complete. At this point, The actual CJ order id is returned in this message. |
| params |  | object | Y |  |  |
| - cjOrderId | CJ order id | string | Y | 200 |  |
| - orderNum | Customer order number | string | Y | 200 | Will be deprecated, please use orderNumber instead |
| - orderNumber | Customer order number | string | Y | 200 |  |
| - orderStatus | CJ order status | string | Y | 200 |  |
| - logisticName | logistic name | string | Y | 200 |  |
| - trackNumber | track number | string | Y | 200 |  |
| - trackingUrl | tracking URL | string | N | 200 |  |
| - updateDate | update date | string | Y | 200 |  |
| - createDate | create date | string | Y | 200 |  |
| - payDate | pay date | string | Y | 200 |  |
| - deliveryDate | delivery date | string | Y | 200 |  |
| - completeDate | complete date | string | Y | 200 |  |
| - orderItems | order item list | List |  |  |  |
| -- vid | Variant Id | string | 200 |  |  |
| -- quantity | quantity | int | 20 |  |  |
| -- sellPrice | Sell Price | BigDecimal | （18，2） | unit：$（USA） |  |
| -- storeLineItemId | The lineItemId of your store order | string | 125 |  |  |
| -- lineItemId | Unique ID of the order item in CJ | string | 50 |  |  |
| -- productionOrderStatus | Production Status | Number | 1 | 1=Pending Order, 2=Pending Production, 3=In Production, 4=Production Completed, 5=Production Abnormality |  |
| -- abnormalType | Abnormal Reason | int[] |  | 6= Image link error, 9= Production drawings don't match the renderings, 10=   Missing hanging ring, 11= Mismatch between die-cutting diagram and printing diagram, 12= uneven edges, 13= letters not connected, 14= Missing order images |  |

#### #Order splitting message

```
{
    "messageId": "7cceede817dc47ed9748328b64353c5c",
    "type": "ORDERSPLIT",
    "messageType": "UPDATE",
    "params": {
        "originalOrderId": "original order id",
        "splitOrderList": [
            {
                "createAt":1673490845706,
                "orderCode":"SD1613355441583259648-2",
                "orderStatus":300,
                "productList":[
                {
                    "sku":"CJNSSYLY01043-Claret-S",
                    "vid":"2547992D-CEE1-4BFD-99AC-9E30354F771F",
                    "quantity":1,
                    "productCode":"1613355657229205504"
                },
                {
                    "sku":"CJJSAQXF00016-Orange",
                    "vid":"A9C95BCB-D824-4AA1-A389-E86F3CCB10EF",
                    "quantity":1,
                    "productCode":"1613355657229205506"
                },
                {
                    "sku":"CJNSSYCS03214-Photo Color-XXL",
                    "vid":"E5FED43E-F9DE-483F-ADCE-8C95D3380315",
                    "quantity":1,
                    "productCode":"1613355657229205507"
                }
                ]
            },
            {
                "createAt":1673490845706,
                "orderCode":"SD1613355441583259648-1",
                "orderStatus":300,
                "productList":[
                    {
                        "sku":"CJNSSYLY01043-White-M",
                        "vid":"0550DFC6-7FF7-4662-AE7D-B4DF0E4EB24A",
                        "quantity":1,
                        "productCode":"1613355657229205505"
                    }
                ]
            }
        ],
        "orderSplitTime": "拆单时间"
    }
}

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| messageId | Message id | string | Y | 50 | Message Id |
| type | Data Type | string | Y | 20 | ORDERSPLIT |
| messageType | Message Type | string | Y | 15 | INSERT、UPDATE、DELETE |
| params |  | Object | Y |  |  |
| - originalOrderId | Original CJ order id | string | N | 200 |  |
| - orderSplitTime | Order Split Date | string | N | 200 |  |
| - splitOrderList | Order List | Order[] | N |  |  |
| - - orderCode | CJ order id | string | N | 200 |  |
| - - createAt | Create date | string | N | 200 |  |
| - - orderStatus | Order status | int | N | 11 |  |
| - - productList | Product Information List | Product[] | N | 200 |  |
| - - - productCode | product code | string | N | 200 |  |
| - - - vid | Variant id | string | N | 200 |  |
| - - - quantity | Quantity | int | N | 10 |  |
| - - - sku | Sku | string | N | 50 |  |

#### #Source product creation result

```
{
    "messageId": "7cceede817dc47ed9748328b64353c5c",
    "type": "SOURCINGCREATE",
    "messageType": "UPDATE",
    "params": {
        "cjProductId":"0550DFC6-7FF7-4662-AE7D-B4DF0E4EB24A",
        "cjVariantId":"0550DFC6-7FF7-4662-AE7D-B4DF0E4EB24A",
        "cjVariantSku":"CJ123582565212",
        "cjSourcingId":"125522",
        "status": "completed",
        "failReason":"",
        "createDate": "2023-02-07 00:00:00"
    }
}

```

| 返回字段 | 字段意思 | 字段类型 | Required | 长度 | 备注 |
| --- | --- | --- | --- | --- | --- |
| messageId | Message id | string | Y | 50 | Message Id |
| type | Data Type | string | Y | 20 | ORDERSPLIT |
| messageType | Message Type | string | Y | 15 | INSERT、UPDATE、DELETE |
| params |  | Object | Y |  |  |
| - cjProductId | CJ product id | string | N | 100 |  |
| - cjVariantId | CJ variant id | string | N | 100 |  |
| - cjVariantSku | CJ variant sku | string | N | 50 |  |
| - cjSourcingId | CJ sourcing Id | string | N | 50 |  |
| - status | status | string | N | 20 |  |
| - failReason | fail reason | string | N | 20 |  |
| - createDate | create date | String | N | 50 |  |

### #Logistics message

```
{
    "messageId": "7cceede817dc47ed9748328b64353c5c",
    "type": "LOGISTIC",
    "messageType": "UPDATE",
    "openId": 12312,
     "params": {
        "orderId": 210823100016290555,
        "logisticName": "CJPacket Ordinary",
        "trackingNumber": "number12345678",
        "trackingStatus": 12,
        "logisticsTrackEvents": "[{\"status\":12,\"activity\":\" Delivered, PO Box\",\"location\":\" NENANA,AK 99760\",\"eventTime\":\"2024-01-18 07:59:22\",\"statusDesc\":\"Delivered\",\"thirdActivity\":\"Delivered, PO Box\",\"thirdLocation\":\"NENANA,AK 99760\",\"thirdEventTime\":\"2024-01-18 07:59:22\"}]"
    }
}

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| messageId | Message Id | string | Y | 200 | Message Id |
| type | Data Type | string | Y | 200 | LOGISTIC |
| messageType | Message Type | string | Y | 15 | INSERT、UPDATE、DELETE |
| params |  | object | Y |  |  |
| - orderId | CJ order id | string | Y | 200 | 210823100016290555 |
| - logisticName | logistic name | string | Y | 200 | CJPacket Ordinary |
| - trackingNumber | tracking number | string | Y | 200 | number12345678 |
| - trackingUrl | tracking URL | string | N | 200 |  |
| - trackingStatus | tracking status | int | Y | 20 | 0- No tracking information available at the moment 1- Warehouse outbound 2- Freight forwarder inbound 3- Freight forwarder return 4- Freight forwarder outbound 5- First leg transportation 6- Arrival at destination country 7- Starting customs clearance 8- Customs clearance completed 9- Terminal retrieval 10- Delivery 11- Arrival waiting for retrieval 12- Sign for 13- Failure/abnormality 14- Return |
| - logisticsTrackEvents | logistics track events | string | Y | 200 | [{"status":12,"activity":" Delivered, PO Box","location":" NENANA,AK 99760","eventTime":"2024-01-18 07:59:22","statusDesc":"Delivered","thirdActivity":"Delivered, PO Box","thirdLocation":"NENANA,AK 99760","thirdEventTime":"2024-01-18 07:59:22"}] |

## #Listening example

### #Example

```
package com.cj.cn.controller;

import com.alibaba.fastjson.JSON;
import com.cj.cn.constant.callback.domain.CallbackParams;
import com.cj.cn.util.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * CJ Webhook Listening Example
 *
 * @author : kay
 */
@RestController
@RequestMapping("/webhookListener")
@Slf4j
public class TestController {

    @PostMapping("/productMessage")
    public Result productMessage(@RequestBody @Validated CallbackParams query) {
        log.info("product message:{}", JSON.toJSONString(query));
        return Result.success(Boolean.TRUE);
    }
}

```

```
package com.cj.cn.constant.callback.domain;

import lombok.Data;

/**
 * @author : kay
 */
@Data
public class CallbackParams {
    private String messageId;
    private String type;
    private Object params;
}

```

```
package com.cj.cn.constant.callback.domain;

import lombok.Getter;
import org.springframework.util.StringUtils;

/**
 * @author : kay
 */
@Getter
public enum CallbackBusinessTypeEnum {
    PRODUCT,
    VARIANT,
    STOCK;

    public static CallbackBusinessTypeEnum create(String name) {
        if (!StringUtils.isEmpty(name)) {
            for (CallbackBusinessTypeEnum typeEnum: CallbackBusinessTypeEnum.values()) {
                if (typeEnum.name().equals(name.toUpperCase())) {
                    return typeEnum;
                }
            }
        }
        return null;
    }
}

```


---

# Sandbox


# #Sandbox

```
1. CJ sandbox account is a test account under production environment

2. The conditions to apply for a sandbox account: 
1) The sandbox account's balance should be $0 which could be adjusted after it's created.
2) It is irreversible once the CJ account is configured as a sandbox account. 

3.Creating Sandbox account currently has not open to the public, but you could reach your agent to help you apply for it.

4. Sandbox account is applied to production environment, so the token is the same with the production token.

5. It is recommended to prepare 2 accounts:   
    1) A production account.   
    2) A sandbox account

```


---

# Interface Definition


# #Interface Definition

## #1，Request Header

### #1.1 url

https://developers.cjdropshipping.com/api2.0/v1/setting/account/set

```
url：https://developers.cjdropshipping.com
identification：api2.0
version：v1
uri: /setting/account/set

```

### #1.2 header

| Name | Required | Note |
| --- | --- | --- |
| Content-Type | Y | default : application/json |
| CJ-Access-Token | Y | default :Your secret key in CJ |

### #1.3 curl

```
curl --location --request PATCH 'https://developers.cjdropshipping.com/api2.0/v1/setting/account/set' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxx' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "openName": "",
                    "openEmail": ""
                }'

```

## #2，Return

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |


---

# Interface Field Definition


## #Interface Field Definitions

## #1 Base Fields

### #1 System Fields

#### #1.1 Return

| Field | Field Meaning | Field Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

#### #1.2 Paging

| Field | Field Meaning | Field Type | Length | Note |
| --- | --- | --- | --- | --- |
| pageNum | Number of current pages | int | 20 |  |
| pageSize | Number of items returned per page | int | 20 |  |
| total | total | int | 20 |  |
| list |  |  | list |  |

### #2 Public Fields

#### #2.1 Region

| Field | Field Meaning | Field Type | Length | Note |
| --- | --- | --- | --- | --- |
| areaId | area id | string | 200 |  |
| areaEn | area name | string | 200 |  |
| countryCode | country code | string | 200 |  |

#### #2.2 People

| Field | Field Meaning | Field Type | Length | Note |
| --- | --- | --- | --- | --- |
| creator | creator | string | 200 |  |
| createTime | create time | string | 200 |  |
| updater | modifier | string | 200 |  |
| updateTime | modify time | string | 200 |  |

#### #2.3 Other

| Field | Field Meaning | Field Type | Length | Note |
| --- | --- | --- | --- | --- |
| sourceFrom | source | byte | 4 |  |
| comment | comment | string | 200 |  |

Remarks:

> sourceFrom: 0-erp entry, 1-store search entry, 2-cj search entry

## #2 Transaction Fields

### #1 Authentication Fields

#### #1.1 Authorization

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| email | Email | string | 200 |  |
| password | Password | string | 200 |  |

#### #1.2 Token

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| accessToken | Access Token | string | 200 |  |
| accessTokenExpiryDate | Access Token expiry time | string | 200 | Default 15 days |
| refreshToken | Refresh Token | string | 200 |  |
| refreshTokenExpiryDate | Refresh Token expiry time | string | 200 | Default 180 days |

### #2 Settings Fields

#### #2.1 Account

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| openId | Account ID | string | 200 |  |
| openName | Account Name | string | 200 |  |
| openEmail | Account Email | string | 200 |  |
| root | Root access | string | 200 | root：NO_PERMISSION - not authorized |
|  |  |  |  | GENERAL - general account |
|  |  |  |  | VIP - VIP account |
|  |  |  |  | ADMIN - administrator |
| isSandbox | (Whether) Sandbox account | byte | 4 |  |

#### #2.2 API Setting

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| setting | Settings | list | 200 |  |
| quotaLimits | Quota limits | list |  | Applicable on specific URLs |
| quotaUrl | Quota URL | string | 200 |  |
| quotaLimit | Quota limit | int | 20 |  |
| quotaType | Quota Type | byte | 4 | 0-total，1-per year，2-per year，3-per quarter，4-per day，5-per hour |
| qpsLimit | QPS limit | int | 20 | Account queries per second |

### #3 Product Fields

#### #3.1 Product

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| pid | Product ID | string | 200 |  |
| productName | Product name | string | 200 |  |
| productNameEn | Product name（EN） | string | 200 |  |
| productSku | Product sku | string | 200 |  |
| productImage | Product image | string | 200 |  |
| productWeight | Product weight | int | 200 | unit: g |
| productType | Product type | byte | 200 |  |
| productUnit | Product unit | string | 48 |  |
| categoryId | Category id | string | 200 |  |
| categoryName | Category name | string | 200 |  |
| entryCode | HS code | string | 200 |  |
| entryName | Customs name | string | 200 |  |
| entryNameEn | Customs name (EN) | string | 200 |  |
| materialName | Material | string | 200 |  |
| materialNameEn | Material (EN) | string | 200 |  |
| materialKey | Material attribute | string | 200 |  |
| packWeight | Package weight | int | 200 | unit: g |
| packingName | Package name | string | 200 |  |
| packingNameEn | Package name (EN) | string | 200 |  |
| packingKey | Package attribute | string | 200 |  |
| isActive | (Whether) Active | boolean | 1 |  |
| description | Description | string | 200 |  |

Product Type

| Product Type | Type |
| --- | --- |
| ORDINARY_PRODUCT | Ordinary product |
| SERVICE_PRODUCT | Service product |
| PACKAGING_PRODUCT | Packaging product |
| SUPPLIER_PRODUCT | Supplier product |
| SUPPLIER_SHIPPED_PRODUCT | Supplier shipped product |

#### #3.2 Variant

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| vid | Variant ID | string | 200 |  |
| variantName | Variant name | string | 200 |  |
| variantNameEn | Variant name (EN) | string | 200 |  |
| variantSku | Variant SKU | string | 200 |  |
| variantUnit | Variant Unit | string | 200 |  |
| variantProperty | Variant Property | string | 200 |  |
| variantKey | Variant Key | string | 200 |  |
| variantLength | Variant Length | int | 200 | unit: mm |
| variantWidth | Variant Width | int | 200 | unit: mm |
| variantHeight | Variant Height | int | 200 | unit: mm |
| variantVolume | Variant Volume | int | 200 | unit: mm3 |
| variantWeight | Variant Weight | int | 200 | unit: g |
| variantSellPrice | Variant Sell Price | double | 200 | unit: $ (USD) |

#### #3.3 Supplier

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |

#### #3.4 Storage

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| storageNum | Available inventory | int | 20 |  |
| queryTime | Refresh rate | string | 200 |  |

### #4 Storage Fields

#### #4.1 Warehouse

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| storageId | Warehouse id | string | 200 |  |
| storageName | Warehouse Name | string | 200 |  |

### #5 Transaction Fields

#### #5.1 Order

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| orderId | Order Id | string | 200 |  |
| orderWeight | order weight | int | 200 |  |
| orderAmount | order amount | double | 200 | unit: $ (USD) |
| orderStatus | order status | string | 200 |  |

Order Status

| Order Status | Status |
| --- | --- |
| CREATED | Order create |
| IN_CART | in cart |
| UNPAID | unpaid |
| UNSHIPPED | unshipped |
| SHIPPED | shipped |
| DELIVERED | delivered |
| CANCELLED | cancelled |

#### #5.2 Amount

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| noWithdrawalAmount | Bonus amount | BigDecimal | (18,2) | unit: $ (USD) |
| freezeAmount | Frozen amount | BigDecimal | (18,2) | unit: $ (USD) |
| amount | Amount | BigDecimal | (18,2) | unit: $ (USD) |

ps：
- 1，BigDecimal（18，2） Length:20, 2 decimal digits.
- 2，CJ Supported international currency: USD ($)

#### #5.3 Shipping

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| shippingCountryCode | shipping country code | string | 200 |  |
| shippingCountry | shipping country | string | 200 |  |
| shippingProvince | shipping province | string | 200 |  |
| shippingCity | shipping city | string | 200 |  |
| shippingAddress | shipping address | string | 200 |  |
| shippingZip | shipping zip | string | 200 |  |
| shippingPhone | shipping phone | string | 200 |  |

### #6 Logistics Fields

#### #6.1 Logistics

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| logisticPrice | Shipping cost | BigDecimal | (18,2) | unit: $ (USD) |
| logisticPriceCn | Shipping cost | BigDecimal | （18，2） | unit: ￥ (CNY) |
| logisticAging | Estimated delivery timespan | string | 20 |  |
| logisticName | Shipping method | string | 20 |  |

#### #6.2 Tracking Number

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| trackingNumber | Tracking number | string | 200 |  |
| trackingFrom | From | string | 20 |  |
| trackingTo | To | string | 20 |  |
| deliveryDay | Delivery timespan | string | 200 |  |
| deliveryTime | Delivered time | string | 200 |  |
| trackingStatus | Tracking status | string | 200 |  |


---

# Interface Call Restrictions


# #Access Frequency Restrictions

Once you got the access token, your application can successfully call the various interfaces provided by the CJ backend
to manage or access the resources of the CJ backend.

In order to prevent application errors from causing an abnormal load on the CJ server, by default, each CJ user is limited
to a certain rate of interface calls, and when this limit is exceeded, the corresponding interface call will receive a error code.

The following is the current default frequency limit, which may be adjusted by the CJ backend depending on operational conditions.

## #Base Frequency
- No more than 10 requests/second per IP address;
- The maximum call frequency for non-login interfaces is 30 requests/second.
- Specific interfaces have separate settings:
- /api2.0/v1/authentication/getAccessTokenOnce every 5 minutes
- /api2.0/v1/authentication/refreshAccessToken5 times per minute

## #Special Frequency

Special settings:
- The interface restricts user access frequency based on user level:
- For Free users or the sales level is 0 or 1, it is limited to 1 request/second;
- For Plus users or the sales level is 2,  it is limited to 2 requests/second;
- For Prime users or the sales level is 3,  it is limited to 4 requests/second;
- For Advanced users or the sales level is 4 or 5,  it is limited to 6 requests/second.


---

# Appendix 1 - Global Error Codes


# #Appendix 1：Global Error Codes

## #Description

Each time the interface is called, a code may be returned. Based on the return, you can debug the interface and troubleshoot errors.

Notes.
- You are supposed to troubleshoot by codes instead of error messages as they may be adjusted.
- If the request parameters do not conform to the json specification, this may result in the CJ server parsing the parameters
incompletely, in which the interface will return "The request parameter is not in a correct JSON format". You need to check the request parameters of json.

## #Error Code Description

| Return Code | Error Description | Troubleshooting |
| --- | --- | --- |
| 200 | Success | Success |
| 1600000 | System busy, please contact CJ IT | System busy, please contact CJ IT |
| 1600001 | Invalid API key or access token. How to get access token: https://developers.cjdropshipping.cn/en/api/api2/api/auth.html#_1-1-get-access-token-post | Get new access token,View Docs |
| 1600002 | access token cannot be empty | Access token cannot be empty， Please input the correct token |
| 1600003 | Invalid Refresh token | Use the correct Refresh token or Get new access token,View Docs |
| 1600031 | Invalid platform token | Invalid platform token, Get new platform access token,View Docs |
| 1600030 | token invalidation fail | token invalidation fail, Get new access token,View Docs |
| 1600004 | Authorization failed, Please check cj account | Please check if your email and API key are correct, or if your API store is Authorized |
| 1600005 | APIkey is wrong, please check and try again | Please check if API key are correct, or if your API store is Authorized |
| 1600006 | Developer account not found | Please check if your email and API key are correct, or if your API store is Authorized |
| 1600007 | The user has been bound to another developer account | The user has been bound to another developer account |
| 1600008 | Authorization failed, Please check cj account | Please check if your email and API key are correct, or if your API store is Authorized |
| 1600009 | Token exchange failed because the code does not exist. | Token exchange failed because the code does not exist. |
| 1600010 | RedirectUri must be not empty. | RedirectUri must be not empty. |
| 1600011 | CallbackUri must be not empty. | CallbackUri must be not empty. |
| 1600012 | The account creation authorization has been disabled, and cj authorization cannot be created. Contact the CJ account manager. | The account creation authorization has been disabled, and cj authorization cannot be created. Contact the CJ account manager. |
| 1600013 | Store info does not exist,please check and try again. | Store info does not exist,please check and try again. |
| 1600100 | Interface is offline | Interface is offline |
| 1600101 | Interface not found | Interface not found |
| 1600200 | Too much request{param} | Regulate the rate of your requests for smoother distribution. Refer to:Access Frequency Restrictions |
| 1600201 | Quota has been used up | Regulate the rate of your requests for smoother distribution. Refer to:Access Frequency Restrictions |
| 1600300 | Param error | Check your parameters and enter correct value. |
| 1600301 | Read timed out | Read timed out, Wait a moment and try again |
| 1601000 | User not found | Please check if your email and API key are correct, or if your API store is Authorized |
| 1602000 | Variant not found | Variant not found |
| 1602001 | Product not found | Product not found |
| 1602002 | Product has been removed from shelves | Order confirm fail, Please contact CJ Agent |
| 1602003 | Variant has been removed from shelves | Variant has been removed from shelves |
| 1602004 | Failed to create infringement report | Failed to create infringement report |
| 1603000 | Order create fail | Order create fail |
| 1603001 | Order confirm fail | Order confirm fail |
| 1603002 | Order delete fail | Order delete fail |
| 1603003 | Order exist, please do not duplicate create | Order exist, please do not duplicate create |
| 1603100 | Order not found, please check the CJ order id | Order not found, please check the CJ order id |
| 1603101 | Order pay fail, please contact CJ order center | Order pay fail, please contact CJ Agent |
| 1603102 | Inventory deduction fail, please contact CJ order center | Inventory deduction fail, please contact CJ Agent |
| 1604000 | Balance is insufficient | Balance is insufficient |
| 1604001 | The balance payment function is temporarily restricted. Please log in to My CJ and make the order payment on the page | please contact CJ Agent |
| 1605000 | Logistic not found | Logistic not found |
| 1605001 | Logistic invalid, please reference freight calculate. | Logistic invalid, please reference freight calculate. |
| 1605002 | country code not found | country code not found |
| 1606000 | Webhook setting add fail, Webhook already have settings | Webhook setting add fail, Webhook already have settings |
| 1606001 | You do not meet our service requirements, Please check and try again. 1.Request Protocols: HTTPS, 2. Request Method: POST, 3.Content-Type: application/json, 4. Response Status Code: 200, 5. Response must be returned within 3 seconds. | Fix and retry |
| 1607000 | You do not meet our service requirements, Please check and try again. 1.Request Protocols: HTTPS, 2. Request Method: POST, 3.Content-Type: application/json, 4. Response Status Code: 200, 5. Response must be returned within 3 seconds. | Fix and retry |
| 1607001 | Please do not use domain names such as localhost, 127.0.0.1 | Fix and retry |
| 1607002 | Webhook url error, Please ensure URL starts with https:// | Fix and retry |
| 1607003 | Webhook url error, Http Status must be 200 | Webhook url error, Http Status must be 200 |
| 16070002 | The CJ page type is not supported | The CJ page type is not supported |
| 1607004 | Freight calculation request failed | Freight calculation request failed |
| 1607006 | Query dispute product request failed | Query dispute product request failed |
| 1607007 | dispute confirm fail | dispute confirm fail |
| 1607008 | dispute create fail | dispute create fail |
| 1607009 | dispute cancel fail | dispute cancel fail |
| 1607010 | product update fail | product update fail |
| 16900202 | Request method '{param}' not supported | Please check the API documentation to confirm which HTTP method is required for this request, update it and retry. |
| 16900203 | Content type not supported[{param}] | Please check the API documentation to confirm which Content-Type is required for this request, update it and retry. |
| 16900204 | Required request body is missing | Check the API documentation and add request body. |
| 16900205 | The request parameter is not in a correct JSON format | Check the API documentation use the correct JSON data |
| 16900403 | {param} can not be empty | Check your parameters and enter correct value. |

## #Troubleshooting methods

### #Error code: 1600200

Interface call exceeds limit.
- For specific frequency policy, Refer to:Access Frequency Restrictions
- The time is the same. For example, if you beyond the minutes limits, you can request again after minutes, while it
will be hours if you beyond the hours limits.
- Our rate limit is not strict. For the calls, the following optimizations are considered.When the interface is implemented, only system failures need call again. For other error codes, the specific failure shall figured out.The call is reasonable or not. For a real-time synchronization, it can be changed to a timed task call as too many calls of one user will cause a bad experience.

### #Error code: 1600300

Invalid Parameter. It doesn't meet the system requirements. You can refer to the specific API interface instruction. Also, you need to confirm:
- It is a correct Http request method. For example, if the interface requires the Post method, you cannot use the Get method.
- It is a correct Http request parameter. For example, if the interface requires a json structure, it cannot be passed as an url parameter or form-data.


---

# Appendix 2 - Country Code


# #Appendix 2：Country Code

| Serial number | Chinese name | English name | The two-letter code | Triplet code | Numeric codes |
| --- | --- | --- | --- | --- | --- |
| 1 | 安道尔 | Andorra | AD | AND | 20 |
| 2 | 阿联酋 | United Arab Emirates(the) | AE | ARE | 784 |
| 3 | 阿富汗 | Afghanistan | AF | AFG | 4 |
| 4 | 安提瓜和巴布达 | Antigua and Barbuda | AG | ATG | 28 |
| 5 | 安圭拉 | Anguilla | AI | AIA | 660 |
| 6 | 阿尔巴尼亚 | Albania | AL | ALB | 8 |
| 7 | 亚美尼亚 | Armenia | AM | ARM | 51 |
| 8 | 安哥拉 | Angola | AO | AGO | 24 |
| 9 | 南极洲 | Antarctica | AQ | ATA | 10 |
| 10 | 阿根廷 | Argentina | AR | ARG | 32 |
| 11 | 美属萨摩亚 | American Samoa | AS | ASM | 16 |
| 12 | 奥地利 | Austria | AT | AUT | 40 |
| 13 | 澳大利亚 | Australia | AU | AUS | 36 |
| 14 | 阿鲁巴 | Aruba | AW | ABW | 533 |
| 15 | 奥兰群岛 | Åland Islands | AX | ALA | 248 |
| 16 | 阿塞拜疆 | Azerbaijan | AZ | AZE | 31 |
| 17 | 波黑 | Bosnia and Herzegovina | BA | BIH | 70 |
| 18 | 巴巴多斯 | Barbados | BB | BRB | 52 |
| 19 | 孟加拉 | Bangladesh | BD | BGD | 50 |
| 20 | 比利时 | Belgium | BE | BEL | 56 |
| 21 | 布基纳法索 | Burkina Faso | BF | BFA | 854 |
| 22 | 保加利亚 | Bulgaria | BG | BGR | 100 |
| 23 | 巴林 | Bahrain | BH | BHR | 48 |
| 24 | 布隆迪 | Burundi | BI | BDI | 108 |
| 25 | 贝宁 | Benin | BJ | BEN | 204 |
| 26 | 圣巴泰勒米岛 | Saint Barthélemy | BL | BLM | 652 |
| 27 | 百慕大 | Bermuda | BM | BMU | 60 |
| 28 | 文莱 | Brunei Darussalam | BN | BRN | 96 |
| 29 | 玻利维亚 | Bolivia (Plurinational State of) | BO | BOL | 68 |
| 30 | 荷兰加勒比区 | Bonaire, Sint Eustatius and Saba | BQ | BES | 535 |
| 31 | 巴西 | Brazil | BR | BRA | 76 |
| 32 | 巴哈马 | Bahamas(the) | BS | BHS | 44 |
| 33 | 不丹 | Bhutan | BT | BTN | 64 |
| 34 | 布韦岛 | Bouvet Island | BV | BVT | 74 |
| 35 | 博茨瓦纳 | Botswana | BW | BWA | 72 |
| 36 | 白俄罗斯 | Belarus | BY | BLR | 112 |
| 37 | 伯利兹 | Belize | BZ | BLZ | 84 |
| 38 | 加拿大 | Canada | CA | CAN | 124 |
| 39 | 科科斯群岛 | Cocos (Keeling) Islands(the) | CC | CCK | 166 |
| 40 | 刚果（金） | Congo (the Democratic Republic of OD | 180 |  |  |
| 41 | 中非 | Central African Republic (the) | CF | CAF | 140 |
| 42 | 刚果（布） | Congo (the) | CG | COG | 178 |
| 43 | 瑞士 | Switzerland | CH | CHE | 756 |
| 44 | 科特迪瓦 | Côte d'Ivoire | CI | CIV | 384 |
| 45 | 库克群岛 | Cook Islands (the) | CK | COK | 184 |
| 46 | 智利 | Chile | CL | CHL | 152 |
| 47 | 喀麦隆 | Cameroon | CM | CMR | 120 |
| 48 | 中国 | China | CN | CHN | 156 |
| 49 | 哥伦比亚 | Colombia | CO | COL | 170 |
| 50 | 哥斯达黎加 | Costa Rica | CR | CRI | 188 |
| 51 | 古巴 | Cuba | CU | CUB | 192 |
| 52 | 佛得角 | Cabo Verde | CV | CPV | 132 |
| 53 | 库拉索 | Curaçao | CW | CUW | 531 |
| 54 | 圣诞岛 | Christmas Island | CX | CXR | 162 |
| 55 | 塞浦路斯 | Cyprus | CY | CYP | 196 |
| 56 | 捷克 | Czechia | CZ | CZE | 203 |
| 57 | 德国 | Germany | DE | DEU | 276 |
| 58 | 吉布提 | Djibouti | DJ | DJI | 262 |
| 59 | 丹麦 | Denmark | DK | DNK | 208 |
| 60 | 多米尼克 | Dominica | DM | DMA | 212 |
| 61 | 多米尼加 | Dominican Republic (the) | DO | DOM | 214 |
| 62 | 阿尔及利亚 | Algeria | DZ | DZA | 12 |
| 63 | 厄瓜多尔 | Ecuador | EC | ECU | 218 |
| 64 | 爱沙尼亚 | Estonia | EE | EST | 233 |
| 65 | 埃及 | Egypt | EG | EGY | 818 |
| 66 | 西撒哈拉 | Western Sahara* | EH | ESH | 732 |
| 67 | 厄立特里亚 | Eritrea | ER | ERI | 232 |
| 68 | 西班牙 | Spain | ES | ESP | 724 |
| 69 | 埃塞俄比亚 | Ethiopia | ET | ETH | 231 |
| 70 | 芬兰 | Finland | FI | FIN | 246 |
| 71 | 斐济群岛 | Fiji | FJ | FJI | 242 |
| 72 | 马尔维纳斯群岛（福克兰） | Falkland Islands (the) [Malvinas] | FK | FLK | 238 |
| 73 | 密克罗尼西亚联邦 | Micronesia (Federated States of) | FM | FSM | 583 |
| 74 | 法罗群岛 | Faroe Islands (the) | FO | FRO | 234 |
| 75 | 法国 | France | FR | FRA | 250 |
| 76 | 加蓬 | Gabon | GA | GAB | 266 |
| 77 | 英国 | United Kingdom of Great Britain and Northern Irela | GB | GBR | 826 |
| 78 | 格林纳达 | Grenada | GD | GRD | 308 |
| 79 | 格鲁吉亚 | Georgia | GE | GEO | 268 |
| 80 | 法属圭亚那 | French Guiana | GF | GUF | 254 |
| 81 | 根西岛 | Guernsey | GG | GGY | 831 |
| 82 | 加纳 | Ghana | GH | GHA | 288 |
| 83 | 直布罗陀 | Gibraltar | GI | GIB | 292 |
| 84 | 格陵兰 | Greenland | GL | GRL | 304 |
| 85 | 冈比亚 | Gambia (the) | GM | GMB | 270 |
| 86 | 几内亚 | Guinea | GN | GIN | 324 |
| 87 | 瓜德罗普 | Guadeloupe | GP | GLP | 312 |
| 88 | 赤道几内亚 | Equatorial Guinea | GQ | GNQ | 226 |
| 89 | 希腊 | Greece | GR | GRC | 300 |
| 90 | 南乔治亚岛和南桑威奇群岛 | South Georgia and the South Sandwich Islands | GS | SGS | 239 |
| 91 | 危地马拉 | Guatemala | GT | GTM | 320 |
| 92 | 关岛 | Guam | GU | GUM | 316 |
| 93 | 几内亚比绍 | Guinea-Bissau | GW | GNB | 624 |
| 94 | 圭亚那 | Guyana | GY | GUY | 328 |
| 95 | 香港 | Hong Kong | HK | HKG | 344 |
| 96 | 赫德岛和麦克唐纳群岛 | Heard Island and McDonald Islands | HM | HMD | 334 |
| 97 | 洪都拉斯 | Honduras | HN | HND | 340 |
| 98 | 克罗地亚 | Croatia | HR | HRV | 191 |
| 99 | 海地 | Haiti | HT | HTI | 332 |
| 100 | 匈牙利 | Hungary | HU | HUN | 348 |
| 101 | 印尼 | Indonesia | ID | IDN | 360 |
| 102 | 爱尔兰 | Ireland | IE | IRL | 372 |
| 103 | 以色列 | Israel | IL | ISR | 376 |
| 104 | 马恩岛 | Isle of Man | IM | IMN | 833 |
| 105 | 印度 | India | IN | IND | 356 |
| 106 | 英属印度洋领地 | British Indian Ocean Territory (the) | IO | IOT | 86 |
| 107 | 伊拉克 | Iraq | IQ | IRQ | 368 |
| 108 | 伊朗 | Iran (Islamic Republic of) | IR | IRN | 364 |
| 109 | 冰岛 | Iceland | IS | ISL | 352 |
| 110 | 意大利 | Italy | IT | ITA | 380 |
| 111 | 泽西岛 | Jersey | JE | JEY | 832 |
| 112 | 牙买加 | Jamaica | JM | JAM | 388 |
| 113 | 约旦 | Jordan | JO | JOR | 400 |
| 114 | 日本 | Japan | JP | JPN | 392 |
| 115 | 肯尼亚 | Kenya | KE | KEN | 404 |
| 116 | 吉尔吉斯斯坦 | Kyrgyzstan | KG | KGZ | 417 |
| 117 | 柬埔寨 | Cambodia | KH | KHM | 116 |
| 118 | 基里巴斯 | Kiribati | KI | KIR | 296 |
| 119 | 科摩罗 | Comoros (the) | KM | COM | 174 |
| 120 | 圣基茨和尼维斯 | Saint Kitts and Nevis | KN | KNA | 659 |
| 121 | 朝鲜 | Korea (the Democratic People's Republic of) | KP | PRK | 408 |
| 122 | 韩国 | Korea (the Republic of) | KR | KOR | 410 |
| 123 | 科威特 | Kuwait | KW | KWT | 414 |
| 124 | 开曼群岛 | Cayman Islands (the) | KY | CYM | 136 |
| 125 | 哈萨克斯坦 | Kazakhstan | KZ | KAZ | 398 |
| 126 | 老挝 | Lao People's Democratic Republic (the) | LA | LAO | 418 |
| 127 | 黎巴嫩 | Lebanon | LB | LBN | 422 |
| 128 | 圣卢西亚 | Saint Lucia | LC | LCA | 662 |
| 129 | 列支敦士登 | Liechtenstein | LI | LIE | 438 |
| 130 | 斯里兰卡 | Sri Lanka | LK | LKA | 144 |
| 131 | 利比里亚 | Liberia | LR | LBR | 430 |
| 132 | 莱索托 | Lesotho | LS | LSO | 426 |
| 133 | 立陶宛 | Lithuania | LT | LTU | 440 |
| 134 | 卢森堡 | Luxembourg | LU | LUX | 442 |
| 135 | 拉脱维亚 | Latvia | LV | LVA | 428 |
| 136 | 利比亚 | Libya | LY | LBY | 434 |
| 137 | 摩洛哥 | Morocco | MA | MAR | 504 |
| 138 | 摩纳哥 | Monaco | MC | MCO | 492 |
| 139 | 摩尔多瓦 | Moldova (the Republic of) | MD | MDA | 498 |
| 140 | 黑山 | Montenegro | ME | MNE | 499 |
| 141 | 法属圣马丁 | Saint Martin (French part) | MF | MAF | 663 |
| 142 | 马达加斯加 | Madagascar | MG | MDG | 450 |
| 143 | 马绍尔群岛 | Marshall Islands (the) | MH | MHL | 584 |
| 144 | 马其顿 | Macedonia (the former Yugoslav Republic of) | MK | MKD | 807 |
| 145 | 马里 | Mali | ML | MLI | 466 |
| 146 | 缅甸 | Myanmar | MM | MMR | 104 |
| 147 | 蒙古国 | Mongolia | MN | MNG | 496 |
| 148 | 澳门 | Macao | MO | MAC | 446 |
| 149 | 北马里亚纳群岛 | Northern Mariana Islands (the) | MP | MNP | 580 |
| 150 | 马提尼克 | Martinique | MQ | MTQ | 474 |
| 151 | 毛里塔尼亚 | Mauritania | MR | MRT | 478 |
| 152 | 蒙塞拉特岛 | Montserrat | MS | MSR | 500 |
| 153 | 马耳他 | Malta | MT | MLT | 470 |
| 154 | 毛里求斯 | Mauritius | MU | MUS | 480 |
| 155 | 马尔代夫 | Maldives | MV | MDV | 462 |
| 156 | 马拉维 | Malawi | MW | MWI | 454 |
| 157 | 墨西哥 | Mexico | MX | MEX | 484 |
| 158 | 马来西亚 | Malaysia | MY | MYS | 458 |
| 159 | 莫桑比克 | Mozambique | MZ | MOZ | 508 |
| 160 | 纳米比亚 | Namibia | NA | NAM | 516 |
| 161 | 新喀里多尼亚 | New Caledonia | NC | NCL | 540 |
| 162 | 尼日尔 | Niger (the) | NE | NER | 562 |
| 163 | 诺福克岛 | Norfolk Island | NF | NFK | 574 |
| 164 | 尼日利亚 | Nigeria | NG | NGA | 566 |
| 165 | 尼加拉瓜 | Nicaragua | NI | NIC | 558 |
| 166 | 荷兰 | Netherlands (the) | NL | NLD | 528 |
| 167 | 挪威 | Norway | NO | NOR | 578 |
| 168 | 尼泊尔 | Nepal | NP | NPL | 524 |
| 169 | 瑙鲁 | Nauru | NR | NRU | 520 |
| 170 | 纽埃 | Niue | NU | NIU | 570 |
| 171 | 新西兰 | New Zealand | NZ | NZL | 554 |
| 172 | 阿曼 | Oman | OM | OMN | 512 |
| 173 | 巴拿马 | Panama | PA | PAN | 591 |
| 174 | 秘鲁 | Peru | PE | PER | 604 |
| 175 | 法属波利尼西亚 | French Polynesia | PF | PYF | 258 |
| 176 | 巴布亚新几内亚 | Papua New Guinea | PG | PNG | 598 |
| 177 | 菲律宾 | Philippines (the) | PH | PHL | 608 |
| 178 | 巴基斯坦 | Pakistan | PK | PAK | 586 |
| 179 | 波兰 | Poland | PL | POL | 616 |
| 180 | 圣皮埃尔和密克隆 | Saint Pierre and Miquelon | PM | SPM | 666 |
| 181 | 皮特凯恩群岛 | Pitcairn | PN | PCN | 612 |
| 182 | 波多黎各 | Puerto Rico | PR | PRI | 630 |
| 183 | 巴勒斯坦 | Palestine, State of | PS | PSE | 275 |
| 184 | 葡萄牙 | Portugal | PT | PRT | 620 |
| 185 | 帕劳 | Palau | PW | PLW | 585 |
| 186 | 巴拉圭 | Paraguay | PY | PRY | 600 |
| 187 | 卡塔尔 | Qatar | QA | QAT | 634 |
| 188 | 留尼汪 | Réunion | RE | REU | 638 |
| 189 | 罗马尼亚 | Romania | RO | ROU | 642 |
| 190 | 塞尔维亚 | Serbia | RS | SRB | 688 |
| 191 | 俄罗斯 | Russian Federation (the) | RU | RUS | 643 |
| 192 | 卢旺达 | Rwanda | RW | RWA | 646 |
| 193 | 沙特阿拉伯 | Saudi Arabia | SA | SAU | 682 |
| 194 | 所罗门群岛 | Solomon Islands | SB | SLB | 90 |
| 195 | 塞舌尔 | Seychelles | SC | SYC | 690 |
| 196 | 苏丹 | Sudan (the) | SD | SDN | 729 |
| 197 | 瑞典 | Sweden | SE | SWE | 752 |
| 198 | 新加坡 | Singapore | SG | SGP | 702 |
| 199 | 圣赫勒拿 | Saint Helena, Ascension and Tristan da Cunha | SH | SHN | 654 |
| 200 | 斯洛文尼亚 | Slovenia | SI | SVN | 705 |
| 201 | 斯瓦尔巴群岛和扬马延岛 | Svalbard and Jan Mayen | SJ | SJM | 744 |
| 202 | 斯洛伐克 | Slovakia | SK | SVK | 703 |
| 203 | 塞拉利昂 | Sierra Leone | SL | SLE | 694 |
| 204 | 圣马力诺 | San Marino | SM | SMR | 674 |
| 205 | 塞内加尔 | Senegal | SN | SEN | 686 |
| 206 | 索马里 | Somalia | SO | SOM | 706 |
| 207 | 苏里南 | Suriname | SR | SUR | 740 |
| 208 | 南苏丹 | South Sudan | SS | SSD | 728 |
| 209 | 圣多美和普林西比 | Sao Tome and Principe | ST | STP | 678 |
| 210 | 萨尔瓦多 | El Salvador | SV | SLV | 222 |
| 211 | 圣马丁岛 | Sint Maarten (Dutch part) | SX | SXM | 534 |
| 212 | 叙利亚 | Syrian Arab Republic | SY | SYR | 760 |
| 213 | 斯威士兰 | Swaziland | SZ | SWZ | 748 |
| 214 | 特克斯和凯科斯群岛 | Turks and Caicos Islands (the) | TC | TCA | 796 |
| 215 | 乍得 | Chad | TD | TCD | 148 |
| 216 | 法属南部领地 | French Southern Territories (the) | TF | ATF | 260 |
| 217 | 多哥 | Togo | TG | TGO | 768 |
| 218 | 泰国 | Thailand | TH | THA | 764 |
| 219 | 塔吉克斯坦 | Tajikistan | TJ | TJK | 762 |
| 220 | 托克劳 | Tokelau | TK | TKL | 772 |
| 221 | 东帝汶 | Timor-Leste | TL | TLS | 626 |
| 222 | 土库曼斯坦 | Turkmenistan | TM | TKM | 795 |
| 223 | 突尼斯 | Tunisia | TN | TUN | 788 |
| 224 | 汤加 | Tonga | TO | TON | 776 |
| 225 | 土耳其 | Turkey | TR | TUR | 792 |
| 226 | 特立尼达和多巴哥 | Trinidad and Tobago | TT | TTO | 780 |
| 227 | 图瓦卢 | Tuvalu | TV | TUV | 798 |
| 228 | 台湾 | Taiwan (Province of China) | TW | TWN | 158 |
| 229 | 坦桑尼亚 | Tanzania, United Republic of | TZ | TZA | 834 |
| 230 | 乌克兰 | Ukraine | UA | UKR | 804 |
| 231 | 乌干达 | Uganda | UG | UGA | 800 |
| 232 | 美国本土外小岛屿 | United States Minor Outlying Islands (the) | UM | UMI | 581 |
| 233 | 美国 | United States of America (the) | US | USA | 840 |
| 234 | 乌拉圭 | Uruguay | UY | URY | 858 |
| 235 | 乌兹别克斯坦 | Uzbekistan | UZ | UZB | 860 |
| 236 | 梵蒂冈 | Holy See (the) | VA | VAT | 336 |
| 237 | 圣文森特和格林纳丁斯 | Saint Vincent and the Grenadines | VC | VCT | 670 |
| 238 | 委内瑞拉 | Venezuela (Bolivarian Republic of) | VE | VEN | 862 |
| 239 | 英属维尔京群岛 | Virgin Islands (British) | VG | VGB | 92 |
| 240 | 美属维尔京群岛 | Virgin Islands (U.S.) | VI | VIR | 850 |
| 241 | 越南 | Viet Nam | VN | VNM | 704 |
| 242 | 瓦努阿图 | Vanuatu | VU | VUT | 548 |
| 243 | 瓦利斯和富图纳 | Wallis and Futuna | WF | WLF | 876 |
| 244 | 萨摩亚 | Samoa | WS | WSM | 882 |
| 245 | 也门 | Yemen | YE | YEM | 887 |
| 246 | 科索沃共和国 | The Republic of Kosovo | YK |  |  |
| 247 | 马约特 | Mayotte | YT | MYT | 175 |
| 248 | 南非 | South Africa | ZA | ZAF | 710 |
| 249 | 赞比亚 | Zambia | ZM | ZMB | 894 |
| 250 | 津巴布韦 | Zimbabwe | ZW | ZWE | 716 |


---

# Appendix 3 - Platforms


# #Appendix 3：Support Platforms

| Platform Name | Definition |
| --- | --- |
| shopify |  |
| Temu |  |
| Temu_us_local |  |
| tiktok |  |
| tiktok_us_cross |  |
| tiktok_us |  |
| Woocommerce |  |
| ebay |  |
| prestashop |  |
| shein |  |
| nuvemshop |  |
| mercado |  |
| bigcommerce |  |
| allvalue |  |
| aliexpress |  |
| api |  |
| shoplazza |  |
| magento |  |
| squarespace |  |
| Shipstation |  |
| wix |  |
| Lazada |  |
| etsy |  |
| shopee |  |


---

# API 1 - Authentication


# #1 Authentication

## #1 Authentication

### #1.1 Get access token（POST）

Token-based authentication, the life of an access token is 15 days, and the life of a refresh token is 180 days.
You can request new access tokens with refresh token when access token  expires. You need to log in when refresh token expires.

> Can only be called once every 5 minutes

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "apiKey": "CJUserNum@api@xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| apiKey | CJ API Key | string | Y | 200 | Get API Key(opens new window) |

> How to get Api Key:Go toGet API Key(opens new window)and click button "Generate"

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "openId": 123456789,
        "accessToken": "f59ac98193d64d62a9e887abea830369",
        "accessTokenExpiryDate": "2021-08-18T09:16:33+08:00",
        "refreshToken": "f7edabe65c3b4a198b50ca8f969e36eb",
        "refreshTokenExpiryDate": "2022-02-07T09:16:33+08:00",
        "createDate": "2021-08-11T09:16:33+08:00"
    },
    "requestId": "8b3d9ea1-00c3-4d10-9e2b-d18041d98080"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| openId | Open Id | Long | 20 |  |
| accessToken | access token | string | 200 |  |
| accessTokenExpiryDate | access token expiry time | string | 200 | Default 15 days |
| refreshToken | Refresh Token | string | 200 |  |
| refreshTokenExpiryDate | Refresh Token expiry time | string | 200 | Default 180 days |
| createDate | Created date | string | 200 |  |

error

```
{
    "code": 1601000,
    "result": false,
    "message": "User not find",
    "data": null,
    "requestId": "a18c9793-7c99-42f9-970b-790eecdceba2"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | Error code | int | 20 | Return to error codes |
| result | Whether returned | boolean | 1 |  |
| message | Return message | string | 200 |  |
| data |  |  |  | Data return |
| requestId | Request ID | string | 48 | For error inquiry |

### #1.2 Refresh access token（POST）

An API security mechanism with which the expiry date of access token can be refreshed. The life of an access token is 15 days.

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/authentication/refreshAccessToken

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/authentication/refreshAccessToken' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "refreshToken": "3d3b01404da04be8b6795d7e9823cee5"
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| refreshToken | Refresh Token | string | Y | 80 |  |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "accessToken": "f59ac98193d64d62a9e887abea830369",
        "accessTokenExpiryDate": "2021-08-18T09:16:33+08:00",
        "refreshToken": "f7edabe65c3b4a198b50ca8f969e36eb",
        "refreshTokenExpiryDate": "2022-02-07T09:16:33+08:00",
        "createDate": "2021-08-11T09:16:33+08:00"
    },
    "requestId": "8b3d9ea1-00c3-4d10-9e2b-d18041d98080"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| accessToken | access token | string | 200 |  |
| accessTokenExpiryDate | access token Expiry Time | string | 200 | Default 15 days |
| refreshToken | Refresh Token | string | 200 |  |
| refreshTokenExpiryDate | Refresh Token Expiry Time | string | 200 | Default 180 days |
| createDate | Created Date | string | 200 |  |

error

```
{
    "code": 1600003,
    "result": false,
    "message": "Refresh token is failure",
    "data": null,
    "requestId": "0b20dc1a-0043-43a7-a7c0-51ca6c61d976"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.3 Logout Token（POST）

API security mechanism. After logging out, access token and refresh token will expire.

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/authentication/logout

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/authentication/logout' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": true,
    "requestId": "b1d3728d-8a29-417e-9983-6df9926aaa49"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

error

```
{
    "code": 1600001,
    "result": false,
    "message": "Authentication failed",
    "data": null,
    "requestId": "5aa2bb6e-42fa-4e0a-ae88-1833c2c1c883"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |


---

# API 2 - Setting


# #2 Settings

## #1 Settings

### #1.1 Get Settings（GET）

Account settings include profile, API quota limits, general API QPS limits, sandbox account, etc.

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/setting/get

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/setting/get' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "openId": 1,
        "openName": "121 2322",
        "openEmail": "v0pjsw5t@linshiyouxiang.net",
        "setting": {
            "quotaLimits": [
                {
                    "quotaUrl": "/api2.0/v1/setting/account/get",
                    "quotaLimit": 74,
                    "quotaType": 0
                }
            ],
            "qpsLimit": 100
        },
        "callback": {
            "product": {
                "type": "ENABLE",
                "urls": ["https://your-domain.com/api2.0/"]
            },"order": {
                "type": "CANCEL",
                "urls": []
            }
        },
        "root": "GENERAL",
        "isSandbox": false
    },
    "requestId": "ea5896b0-273d-4b49-8c54-ad8f025a49b8"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| openId | Account ID | string | 200 |  |
| openName | Account name | string | 200 |  |
| openEmail | Account Email | string | 200 |  |
| setting | Settings | list | 200 |  |
| quotaLimits | Quota limits | list |  | Applicable on specific URLs |
| quotaUrl | Quota URL | string | 200 |  |
| quotaLimit | Quota limit | int | 20 |  |
| quotaType | Quota Type | byte | 4 | 0-total，1-per year，2-per quarter，3-per month，4-per day，5-per hour |
| qpsLimit | QPS limit | int | 20 | account Queries per second |
| root | Root access | string | 200 | root：NO_PERMISSION - not authorized |
|  |  |  |  | GENERAL - general account |
|  |  |  |  | VIP - VIP account |
|  |  |  |  | ADMIN - administrator |
| isSandbox | (Whether) Sandbox account | byte | 4 |  |

error

```
{
    "code": 1601000,
    "result": false,
    "message": "User not find",
    "data": null,
    "requestId": "a18c9793-7c99-42f9-970b-790eecdceba2"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |


---

# API 3 - Product


# #3 Product

## #1 Products

### #1.1 Category List(GET)

Get product categories from CJ.

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/getCategory

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/product/getCategory' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": [
        {
            "categoryFirstName": "Computer & Office",
            "categoryFirstList": [
                {
                    "categorySecondName": "Office Electronics",
                    "categorySecondList": [
                        {
                            "categoryId": "2252588B-72E3-4397-8C92-7D9967161084",
                            "categoryName": "Office & School Supplies"
                        },
                    ]...
                }
            ]    
        }
    ],
    "requestId": "ae543fd1-cdd7-4a61-974a-1340fea678c6"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| categoryFirstName | First level category name | string | 200 |  |
| categoryFirstList | First level category list | Array | - |  |
| categorySecondName | Second level category name | string | 200 |  |
| categorySecondList | Second level category list | Array | - |  |
| categoryId | Third level category ID | string | 200 |  |
| categoryName | Third level category name | string | 200 |  |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.2 Product List V2(GET)

Get all available products from CJ with criteria inquiry supported. V2 version uses elasticsearch search engine for higher performance product search capabilities.

Note:
- Supports keyword search
- Supports multiple filter conditions such as price range, category, country, etc.
- Supports sorting functionality
- Through the features parameter, you can selectively return product details and category information
- page minimum value 1, maximum value 1000; size minimum value 1, maximum value 100

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/listV2

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/product/listV2?page=1&size=20&keyWord=hoodie' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| keyWord | Search keyword | string | N | 200 | Product name or SKU keyword search |
| page | Page number | int | N | 20 | Default 1, minimum 1, maximum 1000 |
| size | Quantity of results on each page | int | N | 20 | Default 10, minimum 1, maximum 100 |
| categoryId | Category ID | string | N | 200 | Filter products by third level category ID |
| lv2categoryList | Second level category ID list | array | N |  | Filter products by second level category ID list |
| lv3categoryList | Third level category ID list | array | N |  | Filter products by third level category ID list |
| countryCode | Country code | string | N | 200 | Format: CN,US,GB,FR etc., filter products with inventory in specified countries |
| startSellPrice | Start sell price | decimal | N |  | Price filter start value |
| endSellPrice | End sell price | decimal | N |  | Price filter end value |
| addMarkStatus | Is free shipping | int | N | 1 | 0-not free shipping, 1-free shipping |
| productType | Product type | int | N | 15 | 4-Supplier product, 10-Video product, 11-Non-video product |
| productFlag | Product flag | int | N | 1 | 0-Trending products, 1-New products, 2-Video products, 3-Slow-moving products |
| startWarehouseInventory | Start warehouse inventory | int | N |  | Filter products with inventory greater than or equal to this value |
| endWarehouseInventory | End warehouse inventory | int | N |  | Filter products with inventory less than or equal to this value |
| verifiedWarehouse | Verified warehouse type | int | N | 1 | null/0-All(default), 1-Verified inventory, 2-Unverified inventory |
| timeStart | Listing time filter start | long | N |  | Listing start time timestamp (milliseconds) |
| timeEnd | Listing time filter end | long | N |  | Listing end time timestamp (milliseconds) |
| zonePlatform | Zone platform suggestion | string | N | 200 | Such as: shopify,ebay,amazon,tiktok,etsy etc. |
| isWarehouse | Is global warehouse search | boolean | N | 1 | true-yes, false-no |
| sort | Sort direction | string | N | 4 | desc-descending(default) / asc-ascending |
| orderBy | Sort field | int | N | 20 | 0=best match(default); 1=listing count; 2=sell price; 3=create time; 4=inventory |
| features | Features list | array | N | 200 | Supported values: enable_description(return product details), enable_category(return product category information), enable_combine(return combine product info), enable_video(return video IDs) |
| supplierId | Supplier ID | string | N | 200 | Filter products by supplier ID |
| hasCertification | Has certification | int | N | 1 | 0-No, 1-Yes |
| isSelfPickup | Is self pickup | int | N | 1 | 0-No, 1-Yes |
| customization | Is customization product | int | N | 1 | 0-No, 1-Yes |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "pageSize": 20,
        "pageNumber": 1,
        "totalRecords": 1000,
        "totalPages": 50,
        "content": [
            {
                "productList": [
                    {
                        "id": "04A22450-67F0-4617-A132-E7AE7F8963B0",
                        "nameEn": "Personalized Belly-baring Cat Ear Hoody Coat",
                        "sku": "CJNSSYWY01847",
                        "spu": "CJNSSYWY01847",
                        "bigImage": "https://cc-west-usa.oss-us-west-1.aliyuncs.com/20210129/2167381084610.png",
                        "sellPrice": "11.85",
                        "nowPrice": "9.50",
                        "listedNum": 100,
                        "categoryId": "5E656DFB-9BAE-44DD-A755-40AFA2E0E686",
                        "threeCategoryName": "Hoodies & Sweatshirts",
                        "twoCategoryId": "5E656DFB-9BAE-44DD-A755-40AFA2E0E685",
                        "twoCategoryName": "Tops & Sets",
                        "oneCategoryId": "5E656DFB-9BAE-44DD-A755-40AFA2E0E684",
                        "oneCategoryName": "Women's Clothing",
                        "addMarkStatus": 1,
                        "isVideo": 0,
                        "videoList": [],
                        "productType": "ORDINARY_PRODUCT",
                        "supplierName": "",
                        "createAt": 1609228800000,
                        "warehouseInventoryNum": 500,
                        "totalVerifiedInventory": 500,
                        "totalUnVerifiedInventory": 0,
                        "verifiedWarehouse": 1,
                        "customization": 0,
                        "hasCECertification": 0,
                        "isCollect": 0,
                        "myProduct": false,
                        "discountPrice": "9.50",
                        "discountPriceRate": "20",
                        "description": "Product description...",
                        "deliveryCycle": "3-5",
                        "saleStatus": "3",
                        "authorityStatus": "1",
                        "isPersonalized": 0
                    }
                ],
                "relatedCategoryList": [
                    {
                        "categoryId": "xxx",
                        "categoryName": "Hoodies"
                    }
                ],
                "keyWord": "hoodie",
                "keyWordOld": "hoodie"
            }
        ]
    },
    "requestId": "f95cd31d-3907-47ce-ac1a-dfdee4315960"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| pageSize | Page size | long | 20 | Number of products per page |
| pageNumber | Current page number | long | 20 | Current requested page number, starts from 1 |
| totalRecords | Total records | long | 20 | Total number of products matching criteria |
| totalPages | Total pages | long | 20 | Total pages |
| content | Content list | array |  | Product data list |

CjProductInfoSearchV2DTO object in content:

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| productList | Product list | array |  | Product information array |
| relatedCategoryList | Related category list | array |  | Related categories matched by search keyword list |
| keyWord | Search keyword | string | 200 | Actual search keyword used |
| keyWordOld | Original search keyword | string | 200 | Original search keyword entered by user |

Product object in productList:

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| id | Product ID | string | 200 | Unique product identifier |
| nameEn | Product name (English) | string | 200 | Product English name |
| sku | Product SPU | string | 200 | Product SPU code |
| spu | Product SPU | string | 200 | Product SPU code |
| bigImage | Product main image | string | 200 | Product main image URL |
| sellPrice | Sell price | string | 20 | Product sell price, unit: USD |
| nowPrice | Discount price | string | 20 | Product discount price |
| discountPrice | Best discount price | string | 20 | Best discount price |
| discountPriceRate | Discount rate | string | 20 | Discount percentage |
| listedNum | Listed number | int | 20 | Number of times this product is listed on the platform |
| isCollect | Is collected | int | 1 | 0-not collected, 1-collected |
| categoryId | Third level category ID | string | 200 | Product third level category ID |
| threeCategoryName | Third level category name | string | 200 | Third level category name (returned only when features contains enable_category) |
| twoCategoryId | Second level category ID | string | 200 | Product second level category ID |
| twoCategoryName | Second level category name | string | 200 | Second level category name (returned only when features contains enable_category) |
| oneCategoryId | First level category ID | string | 200 | Product first level category ID |
| oneCategoryName | First level category name | string | 200 | First level category name (returned only when features contains enable_category) |
| addMarkStatus | Is free shipping | int | 1 | 0-not free shipping, 1-free shipping |
| isVideo | Has video | int | 1 | 0-no video, 1-has video |
| videoList | Video ID list | array |  | Product video ID collection (returned only when features contains enable_video) |
| productType | Product type | string | 20 | Product type code |
| supplierName | Supplier name | string | 200 | Product supplier name |
| createAt | Create time | long | 20 | Product create timestamp (milliseconds) |
| setRecommendedTime | Recommended time | long | 20 | Set recommended timestamp |
| warehouseInventoryNum | Warehouse inventory number | long | 20 | Total inventory number |
| totalVerifiedInventory | Total verified inventory | int | 20 | Total verified inventory |
| totalUnVerifiedInventory | Total unverified inventory | int | 20 | Total unverified inventory |
| verifiedWarehouse | Verified warehouse identifier | int | 1 | 1-Verified inventory, 2-Unverified inventory |
| customization | Is customization product | int | 1 | 0-No, 1-Yes |
| isPersonalized | Is personalized customization | int | 1 | 0-No, 1-Yes |
| hasCECertification | Has CE certification | int | 1 | 0-No, 1-Yes |
| myProduct | Is added to my products | boolean | 1 | true-added, false-not added |
| description | Product description | string | 2000 | Detailed product description (returned only when features contains enable_description) |
| deliveryCycle | Delivery cycle | string | 20 | Product delivery cycle in days |
| saleStatus | Sale status | string | 2 | 3-approved for sale |
| authorityStatus | User visible permission | string | 1 | 0-private visible, 1-all visible |
| autStatus | Product visibility | string | 1 | Product visibility status |
| isAut | Is permanent private | string | 1 | 0-not permanent private, 1-permanent private |
| isList | Is listed | int | 1 | 0-not listed, 1-listed |
| syncListedProductStatus | Listing status | string | 1 | 0-pending, 1-listing, 2-failed, 3-success, 4-cancelled |
| isAd | Is advertisement product | int | 1 | 0-not ad, 1-ad product |
| activityId | Advertisement product ID | string | 200 | Advertisement activity ID |
| directMinOrderNum | Minimum order quantity | string | 20 | Minimum order quantity |
| zoneRecommendJson | Zone recommend list | set |  | Zone recommend tag collection |
| inventoryInfo | Warehouse inventory info | string |  | Warehouse inventory details JSON |
| variantKeyEn | Variant property | string | 200 | Variant property English description |
| variantInventories | Variant inventory info | string |  | Variant inventory details JSON |
| propertyKey | Product logistics property key | string | 200 | Product logistics property keywords |

Product Type

| Product Type | Description | Note |
| --- | --- | --- |
| ORDINARY_PRODUCT | Ordinary product, managed by CJ for inventory management | Managed by CJ for inventory and shipping |
| SERVICE_PRODUCT | Service product, If you need to transfer your own goods to CJ warehouse and CJ provides warehousing services, we will mark it as a service item | Your own products with CJ warehousing services |
| PACKAGING_PRODUCT | Packaging product are used for packaging when shipped from the warehouse. They do not support separate shipping and need to be shipped together with other goods | For packaging only, cannot be sold separately |
| SUPPLIER_PRODUCT | Supplier product, It is a merchant that collaborates with CJ to manage inventory of goods | Supplier products, managed and shipped by CJ |
| SUPPLIER_SHIPPED_PRODUCT | Shipped by supplier management | Supplier products, managed and shipped by suppliers |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | Error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | Return message | string | 200 |  |
| data | Return data | object |  | Business data |
| requestId | Request ID | string | 48 | Flag request for logging errors |

### #1.3 Global Warehouse List(GET)

Get the list of all available global warehouses.

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/globalWarehouseList

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/product/globalWarehouseList' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

#### #Request Parameters

No parameters required

#### #Return

success

```
{
    "code": 200,
    "success": true,
    "message": "Success",
    "data": [
        {
            "areaCn": "中国仓",
            "areaEn": "China Warehouse",
            "areaId": 1,
            "countryCode": "CN",
            "nameEn": "China",
            "valueEn": "CN",
            "disabled": false,
            "zh": "中国仓",
            "en": "China Warehouse",
            "de": "China-Lager",
            "fr": "Entrepôt Chine",
            "th": "คลังสินค้าจีน",
            "id": "1"
        },
        {
            "areaCn": "美国仓",
            "areaEn": "US Warehouse",
            "areaId": 2,
            "countryCode": "US",
            "nameEn": "United States",
            "valueEn": "US",
            "disabled": false,
            "zh": "美国仓",
            "en": "US Warehouse",
            "de": "US-Lager",
            "fr": "Entrepôt américain",
            "th": "คลังสินค้าสหรัฐ",
            "id": "2"
        }
    ],
    "requestId": "ae543fd1-cdd7-4a61-974a-1340fea678c6"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| areaCn | Warehouse name (CN) | string | 200 | Chinese name of the warehouse |
| areaEn | Warehouse name (EN) | string | 200 | English name of the warehouse |
| areaId | Warehouse ID | int | 20 | Unique warehouse identifier |
| countryCode | Country code | string | 10 | ISO country code, e.g., CN, US, GB |
| nameEn | Country name (EN) | string | 200 | English name of the country |
| valueEn | Warehouse code | string | 10 | Warehouse code value, usually matches country code |
| disabled | Is disabled | boolean | 1 | true-disabled, false-available |
| zh | Chinese name | string | 200 | Multi-language support - Chinese |
| en | English name | string | 200 | Multi-language support - English |
| de | German name | string | 200 | Multi-language support - German |
| fr | French name | string | 200 | Multi-language support - French |
| th | Thai name | string | 200 | Multi-language support - Thai |
| id | Warehouse string ID | string | 20 | String format of warehouse ID |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | Error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | Return message | string | 200 |  |
| data | Return data | object |  | Business data |
| requestId | Request ID | string | 48 | Flag request for logging errors |

### #1.4 Product List(GET)

Get all available products from CJ, criteria inquiry supported. 20 results for each page, fixed.

Note:
- Maximum return of 200 data per page.
- Free users or v1 users are limited to a maximum of 1000 requests per day.(2024-09-30 update)
- One IP is limited to a maximum of three users.(2024-09-30 update)
- Query the product list and add "deliveryTime" field (hours). The values are 24, 48, 72, or null (2024-11-15 update)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/list

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/product/list' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| pageNum | Page number | int | N | 20 | Default 1, specifies the page number of the product list to retrieve |
| pageSize | Quantity of results on each page | int | N | 20 | Default 20, number of products returned per page, maximum 200 |
| categoryId | category id | string | N | 200 | Inquiry criteria, filter products by category ID |
| pid | Product id | string | N | 200 | Filter products by unique product identifier |
| productSku | Product sku | string | N | 200 | Filter products by SKU |
| productName | Product name | string | N | 200 | Fuzzy match by product Chinese name |
| productNameEn | Product name(en) | string | N | 200 | Fuzzy match by product English name |
| productType | Product type | string | N | 200 | Optional values: ORDINARY_PRODUCT, SUPPLIER_PRODUCT - Returns all types if not provided |
| countryCode | countryCode | string | N | 200 | Example: CN, US - Filter products with inventory in specified countries |
| deliveryTime | Delivery Time (hours) | string | N | 200 | Optional values: 24 (ships within 24 hours), 48 (ships within 48 hours), 72 (ships within 72 hours) - Returns only products meeting the specified delivery time |
| verifiedWarehouse | Verified Inventory Type | number | N | 1 | Optional values: 1 (Verified), 2 (Unverified) - Not passing values means not restricting queries based on that type |
| startInventory | the minimum inventory | number | N |  | eg: 2, filter products with inventory greater than or equal to this value |
| endInventory | the highest inventory | number | N |  | eg: 10, filter products with inventory less than or equal to this value |
| createTimeFrom | create time(start) | string | N | 200 | format: yyyy-MM-dd hh:mm:ss, filter products created after this time |
| createTimeTo | create time(end) | string | N | 200 | format: yyyy-MM-dd hh:mm:ss, filter products created before this time |
| brandOpenId | brand id | long | N | 200 | Inquiry criteria, filter by brand ID |
| minPrice | minimum price | number | N | 200 | Example: 1.0 - Filter products with price greater than or equal to this value |
| maxPrice | maximum price | number | N | 200 | Example: 2.5 - Filter products with price less than or equal to this value |
| searchType | Search Type | number | N | 5 | Optional values: 0 (All products), 2 (Trending Products), 21 (Trending Products View More) - Default is 0 |
| minListedNum | Minimum Listed Num | number | N | 10 | Example: 1 - Returns products with listing count greater than or equal to this value |
| maxListedNum | Maximum Listed Num | number | N | 10 | Example: 10 - Returns products with listing count less than or equal to this value |
| sort | Sort Type | string | N | 4 | Optional values: desc (descending order), asc (ascending order) - Default: desc |
| orderBy | Sort field | string | N | 20 | Optional values: createAt (sort by creation time), listedNum (sort by listing count) - Default: createAt |
| isSelfPickup | Does the product support self pickup | number | N | 1 | Optional values: 1 (supported), 0 (not supported) |
| supplierId | Supplier Id | string | N | 40 | Filter products by supplier ID |
| isFreeShipping | Is Free Shipping? | int | N | 1 | Optional values: 0 (not free), 1 (free shipping) |
| customizationVersion | Customization Version | int | N | 1 | Optional values: 1 (Platform Customized Version V1), 2 (Platform Customized Version V2), 3 (Customer Customized Version V1), 4 (Customer Customized Version V2), 5 (POD 3.0 Platform Customized) - Filter POD products by customization version |

#### #Return

success

```
{
     "code": 200,
     "result": true,
     "message": "Success",
     "data": {
         "pageNum": 1,
         "pageSize": 20,
         "total": 1,
         "list": [
             {
                 "pid": "04A22450-67F0-4617-A132-E7AE7F8963B0",
                 "productName": "[\"猫耳朵卫衣\",\"定制卫衣\",\"个性化定制\"]",
                 "productNameEn": "Personalized Belly-baring Cat Ear Hoody Coat",
                 "productSku": "CJNSSYWY01847",
                 "productImage": "https://cc-west-usa.oss-us-west-1.aliyuncs.com/20210129/2167381084610.png",
                 "productWeight": 0,
                 "productType": null,
                 "productUnit": "unit(s)",
                 "sellPrice": 11.85,
                 "categoryId": "5E656DFB-9BAE-44DD-A755-40AFA2E0E686",
                 "categoryName": "Women's Clothing / Tops & Sets / Hoodies & Sweatshirts",
                 "remark": "",
                 "createTime": null,
                 "customizationVersion": 1
             }
         ]
     },
     "requestId": "f95cd31d-3907-47ce-ac1a-dfdee4315960"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| pageNum | Page number | int | 20 | Current page number |
| pageSize | Quantity of results on each page | int | 20 | Number of products per page |
| total | Total quantity of results | int | 20 | Total number of products matching criteria |
| list | Product list | Product[] |  | List of product data |
| pid | Product ID | string | 200 | Unique product identifier |
| productName | Product name | string | 200 | Product Chinese name, may be a JSON array string with multiple names |
| productNameEn | Product name(EN) | string | 200 | Product English name |
| productSku | Product sku | string | 200 | Product SKU code |
| productImage | Product image | string | 200 | Product main image URL |
| productWeight | Product weight | int | 200 | Unit: g |
| productType | Product type | byte | 200 | Product type code |
| productUnit | Product unit | string | 48 | Product selling unit |
| categoryId | Category id | string | 200 | Product category ID |
| categoryName | Category name | string | 200 | Product category name |
| remark | Remark | string | 200 | Product remark information |
| addMarkStatus | Is shipping free? (Deprecated, please use isFreeShipping) | int | 1 | 0=Not free shipping, 1=free shipping |
| isFreeShipping | Is shipping free? | boolean | 1 | true for free shipping, false for paid shipping |
| listedNum | Listed number | int | 200 | Number of listings for this product on the platform |
| supplierName | Supplier name | string | 200 | Product supplier name |
| supplierId | Supplier id | string | 200 | Product supplier ID |
| sellPrice | Sell price | decimal | - | Product selling price |
| createTime | Create time | string | - | Product creation time on the platform |
| isVideo | Has video | int | 1 | 1 means includes video, 0 means no video |
| saleStatus | Sale status | int | 20 | 3 means approved for sale |
| customizationVersion | Customization Version | int | 1 | Custom product version number |

Product Type

| Product Type | Description |
| --- | --- |
| ORDINARY_PRODUCT | Ordinary product， managed by CJ for inventory management |
| SERVICE_PRODUCT | Service product, If you need to transfer your own goods to CJ warehouse and CJ provides warehousing services, we will mark it as a service item; |
| PACKAGING_PRODUCT | Packaging product are used for packaging when shipped from the warehouse. They do not support separate shipping and need to be shipped together with other goods; |
| SUPPLIER_PRODUCT | Supplier product,  It is a merchant that collaborates with CJ to manage inventory of goods |
| SUPPLIER_SHIPPED_PRODUCT | shipped by supplier management |

Product Status

| Status Code | Description |
| --- | --- |
| 3 | On Sale |

Customization Version

| Customization Version | remark |
| --- | --- |
| 0 | Non-pod products |
| 1 | Platform Customized Version V1 |
| 2 | Platform Customized Version V2 |
| 3 | Customer Customized Version V1 |
| 4 | Customer Customized Version V2 |
| 5 | POD 3.0 Platform Customized |

Error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.3 Product Details(GET)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/query

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=000B9312-456A-4D31-94BD-B083E2A198E8' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| pid | Product id | string | Choose one of pid, productSku, variantSku | 200 | Inquiry criteria, unique product identifier |
| productSku | Product sku | string | Choose one of pid, productSku, variantSku | 200 | Inquiry criteria, product SPU code |
| variantSku | variant sku | string | Choose one of pid, productSku, variantSku | 200 | Inquiry criteria, variant SKU code |
| features | features | List | N | 200 | Optional values: enable_combine (includes combination variants, returns combination product info when passed), enable_video (includes videos, returns product video info when passed), enable_inventory (includes inventory, returns variant inventory info (include storage id) when passed) |
| countryCode | Country Code | string | N | 2 | Country code such as CN, US - Only returns variants with inventory in that country, no restriction if not passed |

#### #Return

Success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "pid": "000B9312-456A-4D31-94BD-B083E2A198E8",
        "productName": "[\"攀爬车 拖斗车 \",\"攀爬车 \",\"拖斗车 \"]",
        "productNameEn": "Small trailer model",
        "productSku": "CJJJJTJT05843",
        "productImage": "https://cc-west-usa.oss-us-west-1.aliyuncs.com/2054/1672872416690.jpg",
        "productWeight": "1500.0",
        "productUnit": "unit(s)",
        "productType": "ORDINARY_PRODUCT",
        "categoryId": "87CF251F-8D11-4DE0-A154-9694D9858EB3",
        "categoryName": "Home & Garden, Furniture / Home Storage / Home Office Storage",
        "entryCode": "8712008900",
        "entryName": "模型",
        "entryNameEn": "model",
        "materialName": "[\"\",\"金属\"]",
        "materialNameEn": "[\"\",\"metal\"]",
        "materialKey": "[\"METAL\"]",
        "packingWeight": "1580.0",
        "packingName": "[\"\",\"塑料袋\"]",
        "packingNameEn": "[\"\",\"plastic_bag\"]",
        "packingKey": "[\"PLASTIC_BAG\"]",
        "productKey": "[\"颜色\"]",
        "productKeyEn": "Color",
        "productPro": "[\"普货\"]",
        "productProSet": ["普货"],
        "productProEn": "[\"COMMON\"]",
        "productProEnSet": ["COMMON"],
        "sellPrice": 58.09,
        "description": "....",
        "suggestSellPrice": "0.97-4.08",
        "listedNum": 392,
        "status": "3",
        "supplierName": "",
        "supplierId": "",
        "customizationVersion": 1,
        "customizationJson1": "",
        "customizationJson2": "",
        "customizationJson3": "",
        "customizationJson4": "",
        "variants": [
            {
                "vid": "D4057F56-3F09-4541-8461-9D76D014846D",
                "pid": "000B9312-456A-4D31-94BD-B083E2A198E8",
                "variantName": null,
                "variantNameEn": "Small trailer model Black",
                "variantSku": "CJJJJTJT05843-Black",
                "variantUnit": null,
                "variantProperty": null,
                "variantKey": "Black",
                "variantLength": 300,
                "variantWidth": 200,
                "variantHeight": 100,
                "variantVolume": 6000000,
                "variantWeight": 1580.00,
                "variantSellPrice": 58.09,
                "createTime": "2019-12-31T11:14:12.000+00:00"
                "variantStandard": "long=110,width=110,height=30",
                "variantSugSellPrice": 0.97
                "combineVariants":[{}],
                "inventories": [
                    {
                        "countryCode": "CN",
                        "totalInventory": 12912,
                        "cjInventory": 0,
                        "factoryInventory": 12912,
                        "verifiedWarehouse": 2,
                        "stock": [
                            {
                                "stockId": "{6709CCD7-0DC7-43B1-B310-17AB499E9B0A}",
                                "inventory": 0,
                                "factoryInventory": 12912
                            }
                        ]
                    }
                ]
            }...
        ],
        "createrTime": "2019-12-24T01:06:37+08:00"
    },
    "requestId": "d8dc0b6d-0ed8-4e19-8f63-3f207ac39832"
}

```

Product

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| pid | Product ID | string | 200 | Unique product identifier |
| productName | Product name | string | 20 | Product Chinese name, in JSON array format |
| productNameEn | Product name(EN) | string | 200 | Product English name |
| productSku | Product sku | string | 200 | Product SKU code |
| productImage | Product image | string | 200 | Product main image URL |
| productWeight | Product weight | int | 200 | Unit: g |
| productType | Product type | byte | 200 | Product type code |
| productUnit | Product unit | string | 48 | Product selling unit |
| categoryId | Category id | string | 200 | Product category ID |
| categoryName | Category name | string | 200 | Product category name |
| entryCode | HS code | string | 200 | Product customs code |
| entryName | Customs name | string | 200 | Product customs Chinese name |
| entryNameEn | Customs name (EN) | string | 200 | Product customs English name |
| materialName | Material | string | 200 | Product material Chinese name |
| materialNameEn | Material (EN) | string | 200 | Product material English name |
| materialKey | Material attribute | string | 200 | Product material attribute keywords |
| packWeight | Package weight | int | 200 | Unit: g, total weight including packaging |
| packingName | Package name | string | 200 | Packaging material Chinese name |
| packingNameEn | Package name (EN) | string | 200 | Packaging material English name |
| packingKey | Package attribute | string | 200 | Packaging material attribute keywords |
| productKey | Product attribute | string | 200 | Product attribute keywords |
| productKeyEn | Product attribute (EN) | string | 200 | Product attribute English keywords |
| productProSet | Product logistics attributes(Chinese) | string[] |  | Chinese description of product logistics attributes |
| productProEnSet | Product logistics attributes(English) | string[] |  | English description of product logistics attributes |
| addMarkStatus | Is Free Shipping? | int | 1 | 0=not Free, 1=Free |
| description | Description | string | 200 | Detailed product description |
| sellPrice | sell price | string | 200 | Product selling price |
| createrTime | creater time | string | 20 | Product creation time on the platform |
| productVideo | Product video ID list | string[] | 200 | If the product contains videos and features are passed in enable_video, it will return |
| status | status | string | 20 | 3 means approved for sale |
| suggestSellPrice | suggest sell price | string | 20 | Suggested retail price range |
| listedNum | listed number | int | 20 | Number of listings for this product |
| supplierName | supplier name | string | 20 | Product supplier name |
| supplierId | supplier Id | string | 20 | Product supplier ID |
| customizationVersion | customization version | int | 20 | Custom product version number |
| customizationJson1 | customization json | string | 200 | Custom information JSON data 1 |
| customizationJson2 | customization json | string | 200 | Custom information JSON data 2 |
| customizationJson3 | customization json | string | 200 | Custom information JSON data 3 |
| customizationJson4 | customization json | string | 200 | Custom information JSON data 4 |
| variants | Variants | Variant[] |  | List of product variants |

Variant

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| vid | Variant Id | string | 200 | Unique variant identifier |
| pid | Product Id | string | 20 | Parent product identifier |
| variantName | Variant Name | string | 200 | Variant Chinese name |
| variantNameEn | Variant Name(en) | string | 200 | Variant English name |
| variantSku | Variant SKU | string | 200 | Variant SKU code |
| variantImage | Variant Image | string | 200 | Variant image URL |
| variantStandard | Variant Standard | string | 200 | Variant specification description |
| variantUnit | Variant Unit | string | 200 | Variant selling unit |
| variantProperty | Variant Property | string | 200 | Variant property type |
| variantKey | Variant Key | string | 200 | Variant attribute keywords |
| variantLength | Variant Length | int | 200 | Unit: mm |
| variantWidth | Variant Width | int | 200 | Unit: mm |
| variantHeight | Variant Height | int | 200 | Unit: mm |
| variantVolume | Variant Volume | int | 200 | Unit: mm3 |
| variantWeight | Variant Weight | double | 200 | Unit: g |
| variantSellPrice | Variant SellPrice | double | 200 | unit: $ (USD) |
| variantSugSellPrice | Variant Suggest SellPrice | double | 200 | unit: $ (USD) |
| createTime | Vreater Time | string | 200 | Variant creation time |
| combineNum | number of Combine Variants | int |  | Number of sub-variants in combined products |
| combineVariants | Combine Variants | Variant[] | 200 | List of sub-variants for combined products |
| inventories | Variant inventory | Inventory[] | 200 | List of variant inventory (include storage id) |
| - countryCode | inventory country code | string | 200 | Two-letter code of the country where the warehouse is located.for example:US |
| - totalInventory | total inventory number | integer | 200 |  |
| - cjInventory | Inventory management in CJ warehouse | integer | 200 |  |
| - factoryInventory | Inventory management in factory | integer | 200 |  |
| - verifiedWarehouse | Verified Inventory type | string | 200 | 1: verified, 2: unverified |
| - stock | Sub warehouse inventory info | Stock[] | 200 |  |
| -- stockId | Sub warehouse ID | string | 200 |  |
| -- inventory | Sub warehouse Inventory management in CJ warehouse | integer | 200 |  |
| -- factoryInventory | Sub warehouse Inventory management in factory | integer | 200 |  |

Product Type

| Product Type | Description |
| --- | --- |
| ORDINARY_PRODUCT | Ordinary product |
| SERVICE_PRODUCT | Service product |
| PACKAGING_PRODUCT | Packaging product |
| SUPPLIER_PRODUCT | Supplier product |
| SUPPLIER_SHIPPED_PRODUCT | Supplier shipped product |

Product Status

| product status | remark |
| --- | --- |
| 3 | On Sale |

Customization Version

| Customization Version | remark |
| --- | --- |
| 0 | Non-pod products |
| 1 | Platform Customized Version V1 |
| 2 | Platform Customized Version V2 |
| 3 | Customer Customized Version V1 |
| 4 | Customer Customized Version V2 |
| 5 | POD 3.0 Platform Customized |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.4 Add to My Product (POST)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/addToMyProduct

#### #CURL

```
curl --location 'http://localhost:8081/api2.0/v1/product/addToMyProduct' \
--header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
--header 'Content-Type: application/json' \
--data '{
    "productId": "1658748072937136128"
}'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| productId | CJ product id | string | Y | 100 |  |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": true,
    "requestId": "a7d4d01b1eed4db9ac2cc1ab7903c98c",
    "success": true
}

```

error

```
{
    "code": 1600000,
    "result": false,
    "message": "The product has been added to My Products.",
    "data": null,
    "requestId": "b626475ff68242c3abfea562f9d4f899",
    "success": false
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.3 My Product List(GET)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/myProduct/query

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/product/myProduct/query?keyword=CJWJWJYZ02543' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| keyword | sku/spu/product name | string | N | 200 |  |
| categoryId | category id | string | N | 200 |  |
| startAt | start time | string | N | 200 |  |
| endAt | ent time | string | N | 200 |  |
| isListed | isListed | int | N | 200 |  |
| visiable | visiable | int | N | 200 |  |
| hasPacked | hasPacked | int | N | 200 |  |
| hasVirPacked | hasVirPacked | int | N | 200 |  |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "pageSize": 10,
        "pageNumber": 1,
        "totalRecords": 536,
        "totalPages": 54,
        "content": [
            {
                "productId": "01118E21-A8B9-45CE-A16C-75232FB8A14A",
                "packWeight": "530.0",
                "weight": "480.0",
                "productType": "0",
                "propertyKeyList": [
                    "COMMON"
                ],
                "bigImage": "https://cf.cjdropshipping.com/15926688/9714688036284.jpg",
                "nameEn": "3D wooden three-dimensional puzzle",
                "sku": "CJWJWJJM00719",
                "hasPacked": 0,
                "sellPrice": "2.4",
                "discountPrice": null,
                "discountPriceRate": null,
                "defaultArea": "China Warehouse",
                "shopMethod": "CAI NIAO",
                "trialFreight": "0",
                "totalPrice": "2.40",
                "listedShopNum": "0",
                "vid": "7986724D-7214-4B4B-A184-493E7BD78F47",
                "areaId": "1",
                "areaCountryCode": "CN",
                "freightDiscount": "0",
                 "createAt": 1743218214000,
                "lengthList": [
                    335,
                    335
                ],
                "heightList": [
                    200,
                    200
                ],
                "widthList": [
                    225,
                    225
                ],
                "volumeList": [
                    15075000,
                    15075000
                ],
                "hasVirPacked": 1
            }
        ]
    },
    "requestId": "b0f251412bd0446cb56ba5988706d964",
    "success": true
}

```

product

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| productId | Product ID | string | 200 |  |
| productName | Product name | list | 20 |  |
| nameEn | Product name(EN) | string | 200 |  |
| sku | Product sku | string | 200 |  |
| bigImage | Product image | string | 200 |  |
| totalPrice | Product weight | double | 200 | unit: $ (USD) |
| productType | Product type | byte | 200 |  |
| listedShopNum | listed Shop Num | string | 48 |  |
| createAt | Added Time | string | 200 |  |
| trialFreight | trial Freight | string | 200 |  |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

## #2 Variant

### #2.1 Inquiry Of All Variants (GET)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/variant/query

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/product/variant/query?pid=00006BC5-E1F5-4C65-BE2B-3FE0956DA21C' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| pid | Product id | string | Choose one of three | 200 | Inquiry criteria |
| productSku | Product sku | string | Choose one of three | 200 | Inquiry criteria |
| variantSku | variant sku | string | Choose one of three | 200 | Inquiry criteria |
| countryCode | Country Code | string | N | 2 | If the parameter has a value, only variants with inventory in that country will be returned. If no value is passed, inventory will not be restricted |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": [
        {
            "vid": "1D72A20A-D113-4FAB-B4BA-6FE1A6A14A3A",
            "pid": "77501FB4-7146-452E-9889-CDF41697E5CF",
            "variantName": null,
            "variantNameEn": "Wwerwieurieowursdklfjskldjfklsdjfksljfklsdjfkldsjfksdjfksljfksdlfsfdfgf XS",
            "variantSku": "CJJSBGBG01517-XS",
            "variantStandard": "long=5,width=5,height=5",
            "variantUnit": null,
            "variantProperty": null,
            "variantKey": "[\"XS\"]",
            "variantLength": 5,
            "variantWidth": 5,
            "variantHeight": 5,
            "variantVolume": 27,
            "variantWeight": 3.00,
            "variantSellPrice": 3.00,
            "createTime": null
        }
    ],
    "requestId": "00765963-35d0-4a6a-b5cf-aa6731793b10"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| vid | Variant ID | string | 200 |  |
| pid | Product ID | string | 200 |  |
| variantName | Variant name | string | 200 |  |
| variantNameEn | Variant name (EN) | string | 200 |  |
| variantImage | Variant image | string | 200 |  |
| variantSku | Variant sku | string | 200 |  |
| variantUnit | Variant unit | string | 200 |  |
| variantProperty | Variant property | string | 200 |  |
| variantKey | Variant Key | string | 200 |  |
| variantLength | Variant length | int | 200 | Unit: mm |
| variantWidth | Variant width | int | 200 | Unit: mm |
| variantHeight | Variant height | int | 200 | Unit: mm |
| variantVolume | Variant volume | int | 200 | Unit: mm3 |
| variantWeight | Variant weight | int | 200 | Unit: g |
| variantSellPrice | Variant sell price | BigDecimal | 200 | Unit: $ (USD) |
| createTime | Create time | string | 200 |  |
| variantStandard | variant standard | string | 200 |  |
| variantSugSellPrice | variant suggest sell price | BigDecimal | 200 | Unit: $ (USD) |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #2.2 Variant Id Inquiry (GET)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/variant/queryByVid

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/product/variant/queryByVid?vid=1371342252697325568' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| vid | Variant ID | string | Y | 200 | Inquiry criteria |
| features | features | string | N | 200 | enable_inventory (includes inventory, returns variant inventory info (include storage id) when passed) |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "vid": "1371342252697325568",
        "pid": "00006BC5-E1F5-4C65-BE2B-3FE0956DA21C",
        "variantName": null,
        "variantNameEn": "a-Baby pacifier chain test1 Grey",
        "variantSku": "CJJSBGDY00002-Grey",
        "variantUnit": null,
        "variantProperty": "[]",
        "variantKey": "Grey",
        "variantLength": 3,
        "variantWidth": 3,
        "variantHeight": 3,
        "variantVolume": 27,
        "variantWeight": 3.00,
        "variantSellPrice": 3.00,
        "createTime": "2021-03-15T14:07:26.000+00:00",
        "inventories": [
            {
                "countryCode": "CN",
                "totalInventory": 11092,
                "cjInventory": 0,
                "factoryInventory": 11092,
                "verifiedWarehouse": 2,
                "stock": [
                    {
                        "stockId": "{6709CCD7-0DC7-43B1-B310-17AB499E9B0A}",
                        "inventory": 0,
                        "factoryInventory": 11092
                    }
                ]
            }
        ]
    },
    "requestId": "9b86a5e2-40c3-492c-92b2-4634fa4c4a21"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| vid | Variant id | string | 200 |  |
| pid | Product id | string | 200 |  |
| variantName | Variant name | string | 200 |  |
| variantNameEn | Variant name (EN) | string | 200 |  |
| variantImage | Variant image | string | 200 |  |
| variantSku | Variant sku | string | 200 |  |
| variantUnit | Variant unit | string | 200 |  |
| variantProperty | Variant property | string | 200 |  |
| variantKey | Variant key | string | 200 |  |
| variantLength | Variant length | int | 200 | Unit: mm |
| variantWidth | Variant width | int | 200 | Unit: mm |
| variantHeight | Variant height | int | 200 | Unit: mm |
| variantVolume | Variant volume | int | 200 | Unit: mm3 |
| variantWeight | Variant weight | int | 200 | Unit: g |
| variantSellPrice | Variant sell price | BigDecimal | 200 | Unit: $ (USD) |
| createTime | Create time | string | 200 |  |
| variantStandard | Variant standard | string | 200 |  |
| inventories | Variant inventory | Inventory[] | 200 | List of variant inventory (include storage id) |
| - countryCode | inventory country code | string | 200 | Two-letter code of the country where the warehouse is located.for example:US |
| - totalInventory | total inventory number | integer | 200 |  |
| - cjInventory | Inventory management in CJ warehouse | integer | 200 |  |
| - factoryInventory | Inventory management in factory | integer | 200 |  |
| - verifiedWarehouse | Verified Inventory type | string | 200 | 1: verified, 2: unverified |
| - stock | Sub warehouse inventory info | Stock[] | 200 |  |
| -- stockId | Sub warehouse ID | string | 200 |  |
| -- inventory | Sub warehouse Inventory management in CJ warehouse | integer | 200 |  |
| -- factoryInventory | Sub warehouse Inventory management in factory | integer | 200 |  |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

## #3 Inventory

### #3.1 Inventory Inquiry(GET)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/stock/queryByVid?vid=7874B45D-E971-4DC8-8F59-40530B0F6B77

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/product/stock/queryByVid?vid=7874B45D-E971-4DC8-8F59-40530B0F6B77' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| vid | Variant id | string | Y | 200 | Unique variant identifier |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": [
        {
            "vid": "7874B45D-E971-4DC8-8F59-40530B0F6B77",
            "areaId": "1",
            "areaEn": "China Warehouse",
            "countryCode": "CN",
            "storageNum": 10877,
            "totalInventoryNum": 10877,
            "cjInventoryNum": 700,
            "factoryInventoryNum": 10177,
            "stock": [
                {
                    "stockId": "{6709CCD7-0DC7-43B1-B310-17AB499E9B0A}",
                    "inventory": 0,
                    "factoryInventory": 11092
                }
            ]
        }...
    ],
    "requestId": "bcde45ac-da31-4fc7-a05e-e3b23a1e6694"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| vid | Variant id | bigint | 200 | Unique variant identifier |
| areaId | Warehouse id | int | 20 | Warehouse area ID |
| areaEn | Warehouse name | string | 200 | Warehouse area name |
| countryCode | Country code(EN) | string | 20 | Country code where warehouse is located |
| storageNum | total inventory number, please use totalInventoryNum | int | 20 | Deprecated, please use totalInventoryNum |
| totalInventoryNum | total inventory number | int | 20 | Total inventory quantity of this variant in the warehouse |
| cjInventoryNum | Inventory management in CJ warehouse | int | 20 | Inventory quantity managed directly by CJ |
| factoryInventoryNum | Inventory management in factory | int | 20 | Inventory quantity managed by the factory |
| stock | Sub warehouse inventory info | Stock[] | 200 |  |
| -- stockId | Sub warehouse ID | string | 200 |  |
| -- inventory | Sub warehouse Inventory management in CJ warehouse | integer | 200 |  |
| -- factoryInventory | Sub warehouse Inventory management in factory | integer | 200 |  |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #3.2 Query Inventory by SKU (GET)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/stock/queryBySku?sku=CJDS2012593

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/product/stock/queryBySku?sku=CJDS2012593' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| sku | SKU or SPU | string | Y | 200 |  |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": [
        {
            "areaEn": "China Warehouse",
            "areaId": 1,
            "countryCode": "CN",
            "totalInventoryNum": 777566,
            "cjInventoryNum": 0,
            "factoryInventoryNum": 777566,
            "countryNameEn": "China",
            "stock": [
                {
                    "stockId": "{6709CCD7-0DC7-43B1-B310-17AB499E9B0A}",
                    "inventory": 0,
                    "factoryInventory": 11092
                }
            ]
        },
        {
            "areaEn": "US Warehouse",
            "areaId": 2,
            "countryCode": "US",
            "totalInventoryNum": 36,
            "cjInventoryNum": 36,
            "factoryInventoryNum": 0,
            "countryNameEn": "United States of America (the)",
            "stock": [
                {
                    "stockId": "{6709CCD7-0DC7-43B1-B310-17AB499E9B0A}",
                    "inventory": 0,
                    "factoryInventory": 11092
                }
            ]
        }
    ],
    "requestId": "dd4c7d122df24b80a094a4aba073724f",
    "success": true
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| vid | Variant id | bigint | 200 |  |
| areaId | Warehouse id | int | 20 |  |
| areaEn | Warehouse name | string | 200 |  |
| countryCode | Country code(EN) | string | 200 |  |
| countryNameEn | Country name | string | 200 |  |
| totalInventoryNum | total inventory number | int | 20 |  |
| cjInventoryNum | Inventory management in CJ warehouse | int | 20 |  |
| factoryInventoryNum | Inventory management in factory | int | 20 |  |
| stock | Sub warehouse inventory info | Stock[] | 200 |  |
| -- stockId | Sub warehouse ID | string | 200 |  |
| -- inventory | Sub warehouse Inventory management in CJ warehouse | integer | 200 |  |
| -- factoryInventory | Sub warehouse Inventory management in factory | integer | 200 |  |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #3.3 Query inventory by product ID (GET)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/stock/getInventoryByPid?pid=1444929719182168064

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/product/stock/getInventoryByPid?pid=1444929719182168064' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| pid | Product Id | string | Y | 40 |  |

#### #Return

success

```
{
    "success": true,
    "code": 200,
    "message": "",
    "data": {
        "inventories": [
            {
                "areaEn": "US Warehouse",
                "areaId": 2,
                "countryCode": "US",
                "totalInventoryNum": 264,
                "cjInventoryNum": 264,
                "factoryInventoryNum": 0,
                "countryNameEn": "US Warehouse"
            }
        ],
        "variantInventories": [
            {
                "vid": "1796078021431009280",
                "inventory": [
                    {
                        "countryCode": "CN",
                        "totalInventory": 10044,
                        "cjInventory": 0,
                        "factoryInventory": 10044,
                        "verifiedWarehouse": 2,
                        "stock": [
                            {
                                "stockId": "{6709CCD7-0DC7-43B1-B310-17AB499E9B0A}",
                                "inventory": 0,
                                "factoryInventory": 11092
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "requestId": "cb927bfa8400421e923a55f81eaafce0"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | Product Inventory Object | object |  |  |
| - inventories | product inventory list | list |  |  |
| -- areaEn | Warehouse Name | string | 20 | China Warehouse |
| -- areaId | Warehouse id | int | 1 | 1 |
| -- countryCode | Country Code | string | 2 | CN |
| -- totalInventoryNum | total inventory number | int | 20 |  |
| -- cjInventoryNum | Inventory management in CJ warehouse | int | 20 |  |
| -- factoryInventoryNum | Inventory management in factory | int | 20 |  |
| -- countryNameEn | Country Name | string | 200 | China Warehouse |
| - variantInventories | variant inventory list | list |  |  |
| -- vid | variant id | string | 20 | China Warehouse |
| -- inventory | inventory list | list |  | 1 |
| --- countryCode | Country Code | string | 2 | CN |
| --- totalInventoryNum | total inventory number | int | 20 |  |
| --- cjInventoryNum | Inventory management in CJ warehouse | int | 20 |  |
| --- factoryInventoryNum | Inventory management in factory | int | 20 |  |
| --- verifiedWarehouse | Verified Inventory type | int | 200 | 1: verified, 2: unverified |
| --- stock | Sub warehouse inventory info | Stock[] | 200 |  |
| ---- stockId | Sub warehouse ID | string | 200 |  |
| ---- inventory | Sub warehouse Inventory management in CJ warehouse | integer | 200 |  |
| ---- factoryInventory | Sub warehouse Inventory management in factory | integer | 200 |  |
| requestId | requestId | string | 48 | Flag request for logging errors |

## #4 Product Reviews

### #4.1 Inquiry Reviews (GET)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/comments

> Will be deprecated on June 1, 2024, Please use the new
apiInquiry Reviews

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/product/comments?pid=7874B45D-E971-4DC8-8F59-40530B0F6B77' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| pid | Product id | string | Y | 200 | Inquiry criteria |
| score | score | integer | N | 20 | Inquiry criteria |
| pageNum | page number | int | N | 20 | default: 1 |
| pageSize | page size | int | N | 20 | default: 20 |

#### #Return

success

```
{
    "success": true,
    "code": 0,
    "message": null,
    "data": {
        "pageNum": "1",
        "pageSize": "1",
        "total": "285",
        "list": [
            {
                "commentId": 1536993287524069376,
                "pid": "1534092419615174656",
                "comment": "excelente estado, llegó en una semana, cumple con lo descrito.\nBuena calidad de audio.",
                "commentDate": "2022-06-13T00:00:00+08:00",
                "commentUser": "F***o",
                "score": "5",
                "commentUrls": [
                    "https://cc-west-usa.oss-us-west-1.aliyuncs.com/comment/additional/0001/image/2022-06-15/1126211e-ca15-45ed-95f2-880567ebba37.jpg",
                    "https://cc-west-usa.oss-us-west-1.aliyuncs.com/comment/additional/0001/image/2022-06-15/291ab894-068f-4f4e-b01f-57df72902f58.jpg"
                ],
                "countryCode": "MX",
                "flagIconUrl": "https://cc-west-usa.oss-us-west-1.aliyuncs.com/national-flags/phone/US.png"
            }
        ],
    "requestId": "bcde45ac-da31-4fc7-a05e-e3b23a1e6694"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| pid | Product id | String | 200 |  |
| commentId | Comment id | long | 20 |  |
| comment | Comment | string | 200 |  |
| commentUrls | Comment url | string[] | 200 |  |
| commentUser | Comment user | string | 200 |  |
| score | score | int | 20 |  |
| countryCode | Country code | string | 20 |  |
| commentDate | Comment date | string | 200 |  |
| flagIconUrl | FlagIcon url | string | 200 |  |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #4.2 Inquiry Reviews (GET)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/productComments

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/product/productComments?pid=7874B45D-E971-4DC8-8F59-40530B0F6B77' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| pid | Product id | string | Y | 200 | Inquiry criteria |
| score | score | integer | N | 20 | Inquiry criteria |
| pageNum | page number | int | N | 20 | default: 1 |
| pageSize | page size | int | N | 20 | default: 20 |

#### #Return

success

```
{
    "success": true,
    "code": 0,
    "message": null,
    "data": {
        "pageNum": "1",
        "pageSize": "1",
        "total": "285",
        "list": [
            {
                "commentId": 1536993287524069376,
                "pid": "1534092419615174656",
                "comment": "excelente estado, llegó en una semana, cumple con lo descrito.\nBuena calidad de audio.",
                "commentDate": "2022-06-13T00:00:00+08:00",
                "commentUser": "F***o",
                "score": "5",
                "commentUrls": [
                    "https://cc-west-usa.oss-us-west-1.aliyuncs.com/comment/additional/0001/image/2022-06-15/1126211e-ca15-45ed-95f2-880567ebba37.jpg",
                    "https://cc-west-usa.oss-us-west-1.aliyuncs.com/comment/additional/0001/image/2022-06-15/291ab894-068f-4f4e-b01f-57df72902f58.jpg"
                ],
                "countryCode": "MX",
                "flagIconUrl": "https://cc-west-usa.oss-us-west-1.aliyuncs.com/national-flags/phone/US.png"
            }
        ],
    "requestId": "bcde45ac-da31-4fc7-a05e-e3b23a1e6694"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| pid | Product id | String | 200 |  |
| commentId | Comment id | long | 20 |  |
| comment | Comment | string | 200 |  |
| commentUrls | Comment url | string[] | 200 |  |
| commentUser | Comment user | string | 200 |  |
| score | score | int | 20 |  |
| countryCode | Country code | string | 20 |  |
| commentDate | Comment date | string | 200 |  |
| flagIconUrl | FlagIcon url | string | 200 |  |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

## #5 Sourcing

### #5.1 Create Sourcing (POST)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/sourcing/create

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/product/sourcing/create' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "thirdProductId": "",
                    "thirdVariantId": "",
                    "thirdProductSku": "",
                    "productName": "",
                    "productImage": "",
                    "productUrl": "",
                    "remark": "",
                    "price": ""
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| thirdProductId | third product id | string | N | 200 |  |
| thirdVariantId | third variant id | string | N | 200 |  |
| thirdProductSku | third product sku | string | N | 200 |  |
| productName | product name | string | Y | 200 |  |
| productImage | product image | string | Y | 200 |  |
| productUrl | product url | string | N | 200 |  |
| remark | remark | string | N | 200 |  |
| price | price | BigDecimal | 200 | Unit: $ (USD) |  |

#### #Return

success

```
{
    "success": true,
    "code": 0,
    "message": null,
    "data": {
        "cjSourcingId": "285",
        "result"："success",
     }
    "requestId": "bcde45ac-da31-4fc7-a05e-e3b23a1e6694"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| cjSourcingId | CJ sourcing id | string | 50 |  |
| result | search results | string | 20 |  |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #5.2 Query Sourcing(POST)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/product/sourcing/query

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/product/sourcing/query' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "sourceIds": []
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| sourceIds | CJ sourcing id | string[] | Y | 200 |  |

#### #Return

success

```
{
    "success": true,
    "code": 0,
    "message": null,
    "data": {
        "sourceId": "285",
        "sourceNumber"："223333",
        "productId": "3324343434",
        "variantId"："4545456",
        "shopId": "285",
        "shopName"："aaaaaaa",
        "sourceStatus": "5",
        "sourceStatusStr"："搜品失败",
        "cjProductId": "285",
        "cjVariantSku"："CJ287690900",
     }
    "requestId": "bcde45ac-da31-4fc7-a05e-e3b23a1e6694"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| sourceId | CJ sourcing id | string | 50 |  |
| sourceNumber | Search short code | string | 20 |  |
| productId | product id | string | 50 |  |
| variantId | variant id | string | 50 |  |
| shopId | shop id | string | 50 |  |
| shopName | shop name | string | 50 |  |
| sourceStatus | status | string | 10 |  |
| sourceStatusStr | status (chinese) | string | 50 |  |
| cjProductId | CJ product id | string | 50 |  |
| cjVariantSku | CJ variant sku | string | 50 |  |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |


---

# API 4 - Storage


# #04. Storage

## #1 Storage Info

### #1.1 Get Storage Info (GET)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/warehouse/detail

#### #CURL

```
curl --location 'https://developers.cjdropshipping.com/api2.0/v1/warehouse/detail?id=201e67f6ba4644c0a36d63bf4989dd70' \
     --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| id | Storage ID | string | Y | 200 |  |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "id": "201e67f6ba4644c0a36d63bf4989dd70",
        "name": "Cranbury Warehouse",
        "areaId": 2,
        "areaCountryCode": "US",
        "address1": "Cranbury, New Jersey ",
        "address2": null,
        "contacts": null,
        "phone": "+1-9095862127",
        "city": "Cranbury",
        "province": "New Jersey",
        "logisticsBrandList": [
            {
                "id": "USPS",
                "name": "USPS"
            },
            {
                "id": "FedEx",
                "name": "FedEx"
            },
            {
                "id": "UPS",
                "name": "UPS"
            },
            {
                "id": "GOFO",
                "name": "GOFO"
            },
            {
                "id": "DHL",
                "name": "DHL"
            },
            {
                "id": "UniUni",
                "name": "UniUni"
            },
            {
                "id": "CBT",
                "name": "CBT"
            }
        ],
        "isSelfPickup": null,
        "zipCode": null
    },
    "requestId": "2b97f15603384fe4832e85617cf07d9c",
    "success": true
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| id | Storage Id | string | 200 |  |
| name | name | string | 200 |  |
| areaId | area id | integer | 200 |  |
| areaCountryCode | country code | string | 200 |  |
| province | province | string | 200 |  |
| city | city | string | 200 |  |
| address1 | address1 | string | 200 |  |
| address2 | address2 | string | 200 |  |
| contacts | contacts | string | 200 |  |
| phone | phone number | string | 200 |  |
| isSelfPickup | Is support self pickup | integer | 1 | 1: support 0: not supported |
| zipCode | zip Code | string | 200 |  |
| logisticsBrandList | Supported logistics brands | list | 200 |  |
| - id | Logistics brand ID | string | 200 |  |
| - name | Logistics brand Name | string | 200 |  |

error

```
{
    "code": 1608001,
    "result": false,
    "message": "Warehouse info not found",
    "data": null,
    "requestId": "c5d92fbc9c794c5caa0ce453dd9c9236",
    "success": false
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |


---

# API 5 - Shopping


# #05. Shopping

## #About platform logistics order process, please refer to theDocumentation

## #1 Order

### #1.1 Create Order V2（POST）
- Create order
- If you want to use balance payment, set payType 2, and the created order will be processed for subsequent operations: adding shopping cart, confirming order, balance payment
- If you do not want to use balance payment, set payType 3
- Add param platformToken to header, The way to obtain platformToken is the same as the way to obtain CJ Access Token. If not required, the value can be empty. (2025-01-08 update)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --header 'platformToken: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "orderNumber": "1234",
                    "shippingZip": "123",
                    "shippingCountry": "123",
                    "shippingCountryCode": "US",
                    "shippingProvince": "123",
                    "shippingCity": "132",
                    "shippingCounty": "",
                    "shippingPhone": "111",
                    "shippingCustomerName": "123213",
                    "shippingAddress": "123213",
                    "shippingAddress2": "123213",
                    "taxId": "123",
                    "remark": "note",
                    "email": "",
                    "consigneeID": "",
                    "payType": "",
                    "shopAmount": "",
                    "logisticName": "PostNL",
                    "fromCountryCode": "CN",
                    "houseNumber": "123",
                    "iossType": "",
                    "platform": "shopify",
                    "iossNumber": "",
                    "shopLogisticsType": 1,
                    "storageId": "201e67f6ba4644c0a36d63bf4989dd70",
                    "products": [
                        {
                            "vid": "92511400-C758-4474-93CA-66D442F5F787",
                            "quantity": 1,
                            "storeLineItemId": "test-lineItemId-1111"
                        }
                    ]
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| orderNumber | A unique identifier for the order from CJ partner. | string | Y | 50 |  |
| shippingZip | Zip of destination | string | N | 20 |  |
| shippingCountryCode | Country code of destination | string | Y | 20 | Referer:Country Code, Please use The two-letter code |
| shippingCountry | Country of destination | string | Y | 50 |  |
| shippingProvince | Province of destination | string | Y | 50 |  |
| shippingCity | City of destination | string | Y | 50 |  |
| shippingCounty | County of destination | String | N | 50 |  |
| shippingPhone | Phone number of destination | string | N | 20 |  |
| shippingCustomerName | Customer name | string | Y | 50 |  |
| shippingAddress | Shipping address of destination | string | Y | 200 |  |
| shippingAddress2 | Shipping address 2 of destination | string | N | 200 |  |
| houseNumber | House Number | String | N | 20 |  |
| email | Email | String | N | 50 |  |
| taxId | Tax Id | string | N | 20 |  |
| remark | Order remark | string | N | 500 |  |
| consigneeID | consignee id | string | N | 20 |  |
| payType | Pay Type=2 (Balance Payment), Pay Type=3 (No Balance Payment) | int | N | 10 | If using balance payment, payType must be 2 |
| shopAmount | Order Amount | BigDecimal | N | 20 |  |
| logisticName | logistic name | string | Y | 50 | RefererFreight Calculation |
| fromCountryCode | Country code of the shipment from | string | Y | 20 | Referer:Country Code, Please use The two-letter code |
| platform | Platform, Default: Api | String | N | 20 | If this parameter is not passed, the default platform Api will be used. RefererPlatforms |
| iossType | IOSS Type | int | N | 20 | IOSS Type, Options: 1=No IOSS(The recipient will be required to pay VAT and other related fees when the order is declared without IOSS.), 2=Declare with my own IOSS(Please ensure that the IOSS provided is valid and is linked to the destination country in the EU. The declaration will proceed without IOSS if the destination country is not linked to a correct IOSS.), 3=Declare with CJ’s IOSS(Declaration with your store order amount is recommended. You will be responsible for the relevant risks if you choose to declare with CJ order amount. CJ’s IOSS is not applicable for orders valued above €150, and the recipient will be required to pay VAT.),Config Page(opens new window) |
| shopLogisticsType | Shipping mode, default value: 2 | int | N | 20 | Shipping type, Options: 1=Platform Logistics (storageId specified by you, required. When choosing platform logistics mode, the warehouse will start operation after uploading the shipping label. Please upload the shipping label in a timely manner,Upload Shipping and Shipping Label), 2=Seller Logistics (storageId will not be used), 3=Platform Logistics (storageId specified by CJ). If no requirement, please use 2=merchant logistics. Launched on 2025-11-18 |
| storageId | CJ warehouse ID | String | N | 40 | This value is valid when shopLogisticsType=1, Launched on 2025-11-18 |
| iossNumber | IOSS Number | String | N | 10 | If iossType=3, the value is fixed to CJ-IOSS |
| products |  | List | Y | 20 |  |
| - vid | CJ variant id | string | N | 50 | vid and sku cannot both be null. When vid is missing, sku will be used to query the CJ variant. If both are provided, they must refer to the same variant and will be validated accordingly. If the customer account has been granted permission to submit non-CJ SKUs, then the vid field is required |
| - sku | CJ variant sku | string | N | 50 | vid and sku cannot both be null. When vid is missing, sku will be used to query the CJ variant. If both are provided, they must refer to the same variant and will be validated accordingly. |
| - quantity | quantity | int | Y | 50 |  |
| - unitPrice | item pricing | BigDecimal | N | 20 |  |
| - storeLineItemId | lineItemId of your store order | string | N | 125 |  |
| - podProperties | POD customization information | String | N | 500 | podProperties is a string，1：Pod2.0 Example: [{"areaName":"LogoArea","links":["https://cc-west-usa.oss-us-west-1.aliyuncs.com/9f0b99e6-17ec-4dcd-8916-fc5d644be993_LOGO_NavyBlue.png"],"type":"1"}]2：Pod3.0 Example:[{"links": ["Production image URL (multiple allowed)"],"effectImgs": ["Rendering image URL (exactly one required)"]}] |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "orderNumber": "",
        "orderId": "123434',
        "shipmentOrderId": "",
        "iossAmount":  "",
        "iossTaxHandlingFee": "",
        "iossAmount":  "",
        "postageAmount":  "",
        "productAmount": "",
        "productOriginalAmount": "",
        "productDiscountAmount": "",
        "postageDiscountAmount": "",
        "postageOriginalAmount": "",
        "totalDiscountAmount": "",
        "actualPayment": "",
        "orderOriginalAmount": "",
        "cjPayUrl": "",
        "orderAmount": "",
        "logisticsMiss": "",
        "productInfoList": [
            {
                "storeLineItemId": "test-lineItemId-1111",
                "lineItemId": "",
                "variantId": "",
                "isGroup": true,
                "quantity":10,
                "subOrderProducts": [
                    {
                        "lineItemId": "",
                        "variantId": "",
                        "quantity": ""
                    }
                ]
            }
        ],
        "orderStatus": "",
        "interceptOrderReasons": [
            {
                "code": 1001,
                "message": ""
            }
        ]
    },
    "requestId": "9eddf3f5-bd3d-4fae-a4f2-028cbb90db97"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

data information

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| orderId | CJ order id | string | 200 | If the provided product VID is not a CJ SKU, the order id will change, and thus the CJ order id will not be returned. You can monitor the webhook to obtain the latest CJ order id |
| orderNumber | orderNumber | string | 200 |  |
| shipmentOrderId | shipment order id | string | 200 |  |
| iossAmount | ioss amount | BigDecimal | （18，2） | Unit: $ (USD） |
| iossTaxHandlingFee | ioss tax | BigDecimal | （18，2） | Unit: $ (USD） |
| postageAmount | postage amount | BigDecimal | （18，2） | Unit: $ (USD） |
| productAmount | product amount | BigDecimal | （18，2） | Unit: $ (USD） |
| productOriginalAmount | total amount of products (before discount) | BigDecimal | （18，2） | Unit: $ (USD） |
| productDiscountAmount | product discount amount | BigDecimal | （18，2） | Unit: $ (USD） |
| postageDiscountAmount | postage discount amount | BigDecimal | （18，2） | Unit: $ (USD） |
| postageOriginalAmount | postage amount   (before discount) | BigDecimal | （18，2） | Unit: $ (USD） |
| totalDiscountAmount | the total amount of the order after discount | BigDecimal | （18，2） | Unit: $ (USD） |
| actualPayment | the amount actually paid | BigDecimal | （18，2） | Unit: $ (USD） |
| orderOriginalAmount | original order amount | BigDecimal | （18，2） | Unit: $ (USD） |
| cjPayUrl | CJ pay url | string | 200 |  |
| orderAmount | order amount | BigDecimal | 200 |  |
| logisticsMiss | logistics missing mark | Boolean | 10 |  |
| orderStatus | order status | string | 10 |  |
| productInfoList | product information | list |  |  |
| interceptOrderReasons | order interception information | list |  |  |

product information

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| storeLineItemId | lineItemId of your store order | string | 125 |  |
| lineItemId | lineItemId of CJ order | string | 50 |  |
| variantId | variant id | string | 50 |  |
| quantity | quantity | int | 20 |  |
| isGroup | Main product label | boolean | 10 |  |
| subOrderProducts | combination product | list | 10 |  |
| - lineItemId | Unique ID of the order item in CJ | string | 50 |  |
| - variantId | variant id | string | 50 |  |
| - quantity | quantity | int | 20 |  |

Order interception information

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | code | int | 50 |  |
| message | message | string | 200 |  |

error

```
{
   "code": 1600100,
   "result": false,
   "message": "Param error",
   "data": null,
   "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.2 Create Order V3（POST）
- Create order
- Add param platformToken to header, The way to obtain platformToken is the same as the way to obtain CJ Access Token. If not required, the value can be empty. (2025-01-08 update)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV3

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV3' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --header 'platformToken: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "orderNumber": "1234",
                    "shippingZip": "123",
                    "shippingCountry": "123",
                    "shippingCountryCode": "US",
                    "shippingProvince": "123",
                    "shippingCity": "132",
                    "shippingCounty": "",
                    "shippingPhone": "111",
                    "shippingCustomerName": "123213",
                    "shippingAddress": "123213",
                    "shippingAddress2": "123213",
                    "taxId": "123",
                    "remark": "note",
                    "email": "",
                    "consigneeID": "",
                    "shopAmount": "",
                    "logisticName": "PostNL",
                    "fromCountryCode": "CN",
                    "houseNumber": "123",
                    "iossType": "",
                    "platform": "shopify",
                    "iossNumber": ""
                    "shopLogisticsType": 1,
                    "storageId": "201e67f6ba4644c0a36d63bf4989dd70",
                    "products": [
                        {
                            "vid": "92511400-C758-4474-93CA-66D442F5F787",
                            "quantity": 1,
                            "storeLineItemId": "test-lineItemId-1111"
                        }
                    ]
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| orderNumber | A unique identifier for the order from CJ partner. | string | Y | 50 |  |
| shippingZip | Zip of destination | string | N | 20 |  |
| shippingCountryCode | Country code of destination | string | Y | 20 | Referer:Country Code, Please use The two-letter code |
| shippingCountry | Country of destination | string | Y | 50 |  |
| shippingProvince | Province of destination | string | Y | 50 |  |
| shippingCity | City of destination | string | Y | 50 |  |
| shippingCounty | County of destination | String | N | 50 |  |
| shippingPhone | Phone number of destination | string | N | 20 |  |
| shippingCustomerName | Customer name | string | Y | 50 |  |
| shippingAddress | Shipping address of destination | string | Y | 200 |  |
| shippingAddress2 | Shipping address 2 of destination | string | N | 200 |  |
| houseNumber | House Number | String | N | 20 |  |
| email | Email | String | N | 50 |  |
| taxId | Tax Id | string | N | 20 |  |
| remark | Order remark | string | N | 500 |  |
| consigneeID | consignee id | string | N | 20 |  |
| shopAmount | Order Amount | BigDecimal | N | 20 |  |
| logisticName | logistic name | string | Y | 50 | RefererFreight Calculation |
| fromCountryCode | Country code of the shipment from | string | Y | 20 | Referer:Country Code, Please use The two-letter code |
| platform | Platform, Default: Api | String | N | 20 | If this parameter is not passed, the default platform Api will be used. RefererPlatforms |
| iossType | IOSS Type | int | N | 20 | IOSS Type, Options: 1=No IOSS(The recipient will be required to pay VAT and other related fees when the order is declared without IOSS.), 2=Declare with my own IOSS(Please ensure that the IOSS provided is valid and is linked to the destination country in the EU. The declaration will proceed without IOSS if the destination country is not linked to a correct IOSS.), 3=Declare with CJ’s IOSS(Declaration with your store order amount is recommended. You will be responsible for the relevant risks if you choose to declare with CJ order amount. CJ’s IOSS is not applicable for orders valued above €150, and the recipient will be required to pay VAT.),Config Page(opens new window) |
| iossNumber | IOSS Number | String | N | 10 | If iossType=3, the value is fixed to CJ-IOSS |
| shopLogisticsType | Shipping mode, default value: 2 | int | N | 20 | Shipping type, Options: 1=Platform Logistics (storageId specified by you, required. When choosing platform logistics mode, the warehouse will start operation after uploading the shipping label. Please upload the shipping label in a timely manner,Upload Shipping and Shipping Label), 2=Seller Logistics (storageId will not be used), 3=Platform Logistics (storageId specified by CJ). If no requirement, please use 2=merchant logistics. Launched on 2025-11-18 |
| storageId | CJ warehouse ID | String | N | 40 | This value is valid when shopLogisticsType=1, Added on 2025-11-18 |
| products |  | List | Y | 20 |  |
| - vid | CJ variant ID | string | N | 50 | vid and sku cannot both be null. When vid is missing, sku will be used to query the CJ variant. If both are provided, they must refer to the same variant and will be validated accordingly. If the customer account has been granted permission to submit non-CJ SKUs, then the vid field is required |
| - sku | CJ variant sku | string | N | 50 | vid and sku cannot both be null. When vid is missing, sku will be used to query the CJ variant. If both are provided, they must refer to the same variant and will be validated accordingly. |
| - quantity | quantity | int | Y | 50 |  |
| - unitPrice | item pricing | BigDecimal | N | 20 |  |
| - storeLineItemId | lineItemId of your store order | string | N | 125 |  |
| - podProperties | POD customization information | String | N | 500 | podProperties is a string，1：Pod2.0 Example: [{"areaName":"LogoArea","links":["https://cc-west-usa.oss-us-west-1.aliyuncs.com/9f0b99e6-17ec-4dcd-8916-fc5d644be993_LOGO_NavyBlue.png"],"type":"1"}]2：Pod3.0 Example:[{"links": ["Production image URL (multiple allowed)"],"effectImgs": ["Rendering image URL (exactly one required)"]}] |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "orderNumber": "",
        "orderId": "123434',
        "shipmentOrderId": "",
        "iossAmount": ,
        "iossTaxHandlingFee": ,
        "iossAmount": ,
        "postageAmount": ,
        "productAmount": "",
        "productOriginalAmount": "",
        "productDiscountAmount": "",
        "postageDiscountAmount": "",
        "postageOriginalAmount": "",
        "totalDiscountAmount": "",
        "actualPayment": "",
        "orderOriginalAmount": "",
        "cjPayUrl": "",
        "orderAmount": "",
        "logisticsMiss": "",
        "productInfoList": [
            {
                "storeLineItemId": "test-lineItemId-1111",
                "lineItemId": "",
                "variantId": "",
                "isGroup": true,
                "quantity":10,
                "subOrderProducts": [
                    {
                        "lineItemId": "",
                        "variantId": "",
                        "quantity": ""
                    }
                ]
            }
        ],
        "orderStatus": "",
        "interceptOrderReasons": [
            {
                "code": 1001,
                "message": ""
            }
        ]
    },
    "requestId": "9eddf3f5-bd3d-4fae-a4f2-028cbb90db97"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

data information

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| orderId | CJ order id | string | 200 | If the provided product VID is not a CJ SKU, the order id will change, and thus the CJ order id will not be returned. You can monitor the webhook to obtain the latest CJ order id |
| orderNumber | customer order number | string | 200 |  |
| shipmentOrderId | shipment order id | string | 200 |  |
| iossAmount | ioss amount | BigDecimal | （18，2） | Unit: $ (USD） |
| iossTaxHandlingFee | ioss tax | BigDecimal | （18，2） | Unit: $ (USD） |
| postageAmount | postage amount | BigDecimal | （18，2） | Unit: $ (USD） |
| productAmount | product amount | BigDecimal | （18，2） | Unit: $ (USD） |
| productOriginalAmount | total amount of products (before discount) | BigDecimal | （18，2） | Unit: $ (USD） |
| productDiscountAmount | product discount amount | BigDecimal | （18，2） | Unit: $ (USD） |
| postageDiscountAmount | postage discount amount | BigDecimal | （18，2） | Unit: $ (USD） |
| postageOriginalAmount | postage amount   (before discount) | BigDecimal | （18，2） | Unit: $ (USD） |
| totalDiscountAmount | the total amount of the order after discount | BigDecimal | （18，2） | Unit: $ (USD） |
| actualPayment | the amount actually paid | BigDecimal | （18，2） | Unit: $ (USD） |
| orderOriginalAmount | original order amount | BigDecimal | （18，2） | Unit: $ (USD） |
| cjPayUrl | CJ pay url | string | 200 |  |
| orderAmount | order amount | BigDecimal | 200 |  |
| logisticsMiss | logistics missing mark | Boolean | 10 |  |
| orderStatus | order status | string | 10 |  |
| productInfoList | product information | list |  |  |
| interceptOrderReasons | order interception information | list |  |  |

product information

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| storeLineItemId | lineItemId of your store order | String | 125 |  |
| lineItemId | Unique ID of the order item in CJ | string | 50 |  |
| variantId | variant id | string | 50 |  |
| quantity | quantity | int | 20 |  |
| isGroup | Main product label | boolean | 10 |  |
| subOrderProducts | combination product | list | 10 |  |
| - lineItemId | Unique ID of the order item in CJ | string | 50 |  |
| - variantId | CJ variant id | string | 50 |  |
| - quantity | quantity | int | 20 |  |

Order interception information

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | code | int | 50 |  |
| message | message | string | 200 |  |

error

```
{
   "code": 1600100,
   "result": false,
   "message": "Param error",
   "data": null,
   "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.3 Add Cart

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/order/addCart

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/addCart' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "cjOrderIdList": ["SD25080109282603297001"]
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| cjOrderIdList | CJ order id | List | Y | 200 | Query |

#### #Return

success

```
{
    "success": true,
    "code": 200,
    "message": "Congratulation! Well done!",
    "data": {
        "successCount": 1,
        "addSuccessOrders": [
            "SD25080109282603297001"
        ],
        "unInterceptAddressCount": 0,
        "interceptOrders": []
    }
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

error

```
{
    "code": 1603001,
    "result": false,
    "message": "order confirm fail",
    "data": null,
    "requestId": "7dc61955-c0e8-4731-bb9b-393b4fffeaaf"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.4 Add Cart Confirm (POST)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/order/addCartConfirm

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/addCartConfirm' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "cjOrderIdList": ["SD25080109282603297001"]
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| cjOrderIdList | CJ order id | List | Y | 200 | Query |

#### #Return

success

```
{
    "success": true,
    "code": 200,
    "message": "Congratulation! Well done!",
    "data": {
        "successCount": 1,
        "submitSuccess": true,
        "shipmentsId": "",
        "result": 0,
        "interceptOrders": []
    }
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| - successCount | Success Count |  |  |  |
| - submitSuccess | Is the submission successful |  |  |  |
| - shipmentsId | Shipment Order Id |  |  |  |
| - result |  |  |  |  |
| - interceptOrders | Intercepted order ID List | List |  |  |
| requestId | requestId | string | 48 | Flag request for logging errors |

error

```
{
    "code": 1603001,
    "result": false,
    "message": "order confirm fail",
    "data": null,
    "requestId": "7dc61955-c0e8-4731-bb9b-393b4fffeaaf"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.5 Save Generate Parent Order(POST)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/order/saveGenerateParentOrder

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/saveGenerateParentOrder' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "shipmentOrderId": "SD25080109282603297001"
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| shipmentOrderId | Shipment Order Id | string | Y | 200 | Query |

#### #Return

success

```
{
  "success": true,
  "message": "",
  "data": {
    "orderMoney": 99.99,
    "payExpireTime": "2024-12-31 23:59:59",
    "payId": "PAY123456789",
    "result": 0,
    "submitSuccess": true,
    "unMatchOrderCodes": ["ORDER001", "ORDER002"],
    "successOrders": ["ORDER003", "ORDER004"],
    "unMatchProductCodes": ["PROD001", "PROD002"],
    "paymentInformation": {
      "actualPayment": 89.99,
      "balanceDeduction": 10.00,
      "billAmount": 12.50,
      "canDeduct": true,
      "commodityDiscount": 5.00,
      "commodityTotalAmount": 94.99,
      "couponAmount": 15.00,
      "freight": 5.00,
      "iossAmount": 2.50,
      "iossNumber": "IOSS123456",
      "iossTaxHandlingFee": 0.50,
      "iossTaxes": 2.00,
      "iossType": 3,
      "orderOriginalAmount": 104.99,
      "orderProductAmount": 94.99,
      "payableAmount": 89.99,
      "postageDiscount": 0.00,
      "serviceFee": 1.00
    },
    "interceptOrders": [
    ]
  }
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

error

```
{
    "code": 1603001,
    "result": false,
    "message": "order confirm fail",
    "data": null,
    "requestId": "7dc61955-c0e8-4731-bb9b-393b4fffeaaf"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.6 List Order（GET）

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/order/list?pageNum=1&pageSize=10

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/list?pageNum=1&pageSize=10' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| pageNum | Page number | int | N | 20 | Default 1 |
| pageSize | Quantity of results on each page | int | N | 20 | Default 20 |
| orderIds | order id | string[] | N | 100 |  |
| shipmentOrderId | Shipment Order Id | string | N | 100 |  |
| status | order status | string | N | 200 | default: CANCELLED, values: CREATED,IN_CART,UNPAID,UNSHIPPED,SHIPPED,DELIVERED,CANCELLED,OTHER |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "pageNum": 1,
        "pageSize": 10,
        "total": 6859,
        "list": [
            {
                "orderId": "1377085655003308032",
                "orderNum": "50166125936666",
                "cjOrderId": null,
                "shippingCountryCode": "SG",
                "shippingProvince": "Singapore",
                "shippingCity": "Singapore",
                "shippingPhone": "6587997352",
                "shippingAddress": "Singapore,07  Anson  Tanjong  Pagar,79 ANSON ROAD,79 Anson Road #01-01, Phoenix Tower",
                "shippingCustomerName": "KUDO KANJI ",
                "remark": "",
                "orderWeight": 0,
                "orderStatus": "CREATED",
                "orderAmount": null,
                "productAmount": 0,
                "postageAmount": null,
                "logisticName": null,
                "trackNumber": null,
                "createDate": "2021-03-31 00:46:39",
                "paymentDate": null,
                "productList": null,
                "storageId": "201e67f6ba4644c0a36d63bf4989dd70",
                "storageName": "Cranbury Warehouse"
            }...
        ]
    }
}        

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| orderId | order id | string | 200 |  |
| orderNum | order name | string | 200 |  |
| cjOrderId | CJ order id | string | 200 |  |
| shippingCountryCode | country code | string | 200 |  |
| shippingProvince | province | string | 200 |  |
| shippingCity | city | string | 200 |  |
| shippingAddress | shipping address | string | 200 |  |
| shippingCustomerName | shipping name | string | Y | 200 |
| shippingPhone | phone number | string | 200 |  |
| remark | order remark | string | 500 |  |
| logisticName | logistic name | string | 200 |  |
| trackNumber | track number | string | 200 |  |
| trackingUrl | tracking URL | string | N | 200 |
| orderWeight | order weight | int | 20 |  |
| orderAmount | order amount | BigDecimal | （18，2） | Unit: $ (USD） |
| orderStatus | order status | string | 200 |  |
| createDate | create time | string | 200 |  |
| paymentDate | pay time | string | 200 |  |
| storeCreateDate | Store order creation time | DateTime | 1 | UTC Time, eg: 2025-03-14 13:21:07 |
| productAmount | product amount | BigDecimal | （18，2） | Unit: $ (USD） |
| postageAmount | postage amount | BigDecimal | （18，2） | Unit: $ (USD） |
| storageId | storage id | string | 200 | Added on 2025-11-18 |
| storageName | storage name | string | 200 | Added on 2025-11-18 |

Order Status

| Order Status | Status | remark |
| --- | --- | --- |
| CREATED | order create | create order, wait confirm |
| IN_CART | in cart | wait confirm, api merge this state |
| UNPAID | unpaid | confirm order, CJ order number create |
| UNSHIPPED | unshipped | paid, wait for sending |
| SHIPPED | shipped | in transit, get tracking number |
| DELIVERED | delivered | clients receving |
| CANCELLED | cancelled |  |

error

```
{
   "code": 1600100,
   "result": false,
   "message": "Param error",
   "data": null,
   "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.7 Query Order（GET）

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/order/getOrderDetail?orderId=210711100018043276

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/getOrderDetail?orderId=210711100018043276&features=f1&features=f2' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

#### #Request Parameters

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| orderId | order id | string | Y | 200 | support: Custom order id, CJ order id |
| features | features | List | false | 20 | If a feature is passed in, the relevant function will be enabled. If multiple features are required, pass multiple feature parameters |

#### #Feature enumeration

| Enumeration | Description |
| --- | --- |
| LOGISTICS_TIMELINESS | Enable querying logistics timeliness. After passing in this feature enumeration, logisticTimelines will be returned in the results |

#### #Response

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "orderId": "210823100016290555",
        "orderNum": "api_52f268d40b8d460e82c0683955e63cc9",
        "platformOrderId": "6387689586969",
        "cjOrderId": null,
        "shippingCountryCode": "US",
        "shippingProvince": "Connecticut",
        "shippingCity": "ftdsr",
        "shippingPhone": "43514123",
        "shippingAddress": "rfdxf rfdesr",
        "shippingCustomerName": "Xu Old",
        "remark": null,
        "orderWeight": 20,
        "orderStatus": "CREATED",
        "orderAmount": 4.25,
        "productAmount": 0.57,
        "postageAmount": 3.68,
        "logisticName": "CJPacket Ordinary",
        "trackNumber": null,
        "createDate": "2021-08-23 11:31:45",
        "paymentDate": null,
        "isComplete":1,
        "fromCountryCode":"CN",
        "storageId": "201e67f6ba4644c0a36d63bf4989dd70",
        "storageName": "Cranbury Warehouse",
        "productList": [
            {
                "vid": "1392053744945991680",
                "quantity": 1,
                "sellPrice": 0.57,
				"podPropertiesInfo": null,
                "lineItemId": "2505170958390976500",
                "storeLineItemId": "16045188153625",
                "productionOrderStatus": 1,
                "abnormalType": [
                    6,
                    9
                ]
            }
        ]
    },
    "requestId": "3adccdcb-d41b-4808-996b-c7c5c833d77d"
}

```

POD order return information

```
{
	"code": 200,
	"result": true,
	"message": "Success",
	"data": {
		"orderId": "210823100016290555",
		"orderNum": "api_52f268d40b8d460e82c0683955e63cc9",
		"cjOrderId": null,
		"platformOrderId": "6387689586969",
        "shippingCountryCode": "US",
		"shippingProvince": "Connecticut",
		"shippingCity": "ftdsr",
		"shippingPhone": "43514123",
		"shippingAddress": "rfdxf rfdesr",
		"shippingCustomerName": "Xu Old",
		"remark": null,
		"orderWeight": 20,
		"orderStatus": "CREATED",
		"orderAmount": 4.25,
		"productAmount": 0.57,
		"postageAmount": 3.68,
		"logisticName": "CJPacket Ordinary",
		"trackNumber": null,
		"createDate": "2021-08-23 11:31:45",
		"paymentDate": null,
		"isComplete": 1,
		"fromCountryCode": "CN",
		"storageId": "201e67f6ba4644c0a36d63bf4989dd70",
        "storageName": "Cranbury Warehouse",
		"productList": [
			{
				"vid": "1392053744945991680",
				"quantity": 1,
				"sellPrice": 0.57,
				"lineItemId": "2505170958390976500",
                "storeLineItemId": "16045188153625",
                "productionOrderStatus": 1,
                "abnormalType": [
                    6,
                    9
                ]
				"podPropertiesInfo": {
                    "image": "https://pod-picture.oss-cn.aliyuncs.com/LX/PO-211-12729261699191806-1.jpg",
                    "isFixedCustom": false,
                    "podVersion": 3,
                    "failedList": [],
                    "effectImgList": [
                        "https://pod-picture.oss-cn.aliyuncs.com/LX/PO-211-1.jpg?podThumbnailUrl=https%3A%2F%2Fpod-picture.oss-cn.aliyuncs.com%2Fpod%2F250428%2Fpod-picture_oss-cn-211-12729261699191806-1_jpg.1440x1440.webp&podOriginSize=638820&podOriginPxUrl=https%3A%2F%2Fpod-picture.oss-cn-hangzhou.aliyuncs.com%2Fpod_infinity%2F250428%2Fpod-picture_oss-cn-hangzhou_aliyuncs_com_LX_PO-211-12729261699191806-1_jpg.InfinityxInfinity.webp&podOriginPx=1936_1854&podOriginOss=https%3A%2F%2Fpod-picture.oss-cn-hangzhou.aliyuncs.com%2Fpod_origin%2F250428%2Fpod-picture_oss-cn-hangzhou_aliyuncs_com_LX_PO-211-1_jpg.InfinityxInfinity.jpg"
                    ],
                    "finish": 1,
                    "customResources": [],
                    "type": 5,
                    "customMessgae": {
                        "podType": 1,
                        "color": {},
                        "zone": {
                            "back": {},
                            "front": {}
                        }
                    },
                    "productionImgList": [
                        "https://pod-picture.oss-cn.aliyuncs.com/LX/PO-211-1.jpg?podThumbnailUrl=https%3A%2F%2Fpod-picture.oss.aliyuncs.com%2Fpod%2F250428%2Fpod-picture_oss-cn-hangzhou_aliyuncs_com_LX_PO-211-12729261699191806-1_jpg.1440x1440.webp&podOriginSize=638820&podOriginPxUrl=https%3A%2F%2Fpod-picture.oss-cn-hangzhou.aliyuncs.com%2Fpod_infinity%2F250428%2Fpod-picture_oss-cn-hangzhou_aliyuncs_com_LX_PO-211-12729261699191806-1_jpg.InfinityxInfinity.webp&podOriginPx=1936_1854&podOriginOss=https%3A%2F%2Fpod-picture.oss-cn-hangzhou.aliyuncs.com%2Fpod_origin%2F250428%2Fpod-picture_oss-cn-hangzhou_aliyuncs_com_LX_PO-211-12729261699191806-1_jpg.InfinityxInfinity.jpg"
                    ],
                    "customDesign": [
                        {
                            "img": "https://oss-cf.cjdropshipping.com/product/2025/04/22/01/180af06e-7b7-4662-b975-070203989480.jpg",
                            "areaNameEn": "",
                            "printWidth": "50",
                            "typeName": "",
                            "type": "1",
                            "scaleX": "1",
                            "backImgList": [
                                {
                                    "color": "1pcs",
                                    "imgSrc": "https://oss-cf.cjdropshipping.com/product/2025/04/22/01/00e2483-b3b2-4873-80ac-e71f4d760e1f.jpg"
                                },
                                {
                                    "color": "4pcs",
                                    "imgSrc": "https://oss-cf.cjdropshipping.com/product/2025/04/22/01/0c42181-d63f-49f9-b6d5-d55574027fcb.jpg"
                                },
                                {
                                    "color": "10pcs",
                                    "imgSrc": "https://oss-cf.cjdropshipping.com/product/2025/04/22/01/1ae2f95-5484-4d30-a93f-64bc740832d2.jpg"
                                },
                                {
                                    "color": "16pcs",
                                    "imgSrc": "https://oss-cf.cjdropshipping.com/product/2025/04/22/01/53ce421-33db-4249-8862-f36ad20083b5.jpg"
                                },
                                {
                                    "color": "18pcs",
                                    "imgSrc": "https://oss-cf.cjdropshipping.com/product/2025/04/22/01/245e348-a87b-4196-a3a4-056f6b391301.jpg"
                                }
                            ],
                            "printHeight": "50",
                            "scaleY": "1",
                            "podType": "4",
                            "top": "297.99999928474426",
                            "areaName": "DIY",
                            "left": "253.99999994039536",
                            "areaType": "1",
                            "imgicon": "",
                            "angle": "0",
                            "fontSize": 12,
                            "fontSpace": 0,
                            "sku": ""
                        }
                    ]
                }
			}
		]
	},
	"requestId": "3adccdcb-d41b-4808-996b-c7c5c833d77d"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| orderId | order id | string | 200 |  |
| orderNum | order name | string | 200 |  |
| platformOrderId | Shop order ID | string | 200 |  |
| cjOrderId | CJ order id | string | 200 |  |
| cjOrderCode | CJ order code | string | 200 |  |
| fromCountryCode | shipment country code | string | 200 |  |
| shippingCountryCode | Recipient country code | string | 200 |  |
| shippingProvince | Recipient province | string | 200 |  |
| shippingCity | Recipient city | string | 200 |  |
| shippingAddress | Recipient address | string | 200 |  |
| shippingCustomerName | Recipient name | string | 200 |  |
| shippingPhone | Recipient phone number | string | 200 |  |
| remark | order remark | string | 500 |  |
| logisticName | logistic name | string | 200 |  |
| trackNumber | track number | string | 200 |  |
| trackingUrl | tracking URL | string | 200 |  |
| disputeId | CJ dispute ID | string | 50 |  |
| orderWeight | order weight | int | 20 |  |
| orderAmount | Order amount | BigDecimal | （18,2） | Unit: $ (USD） |
| orderStatus | Order status | string | 200 |  |
| createDate | Create time | string | 200 | UTC Time |
| paymentDate | Pay time | string | 200 | UTC Time |
| outWarehouseTime | Delivery time | DateTime | 1 | UTC Time, eg: 2025-03-14 13:21:07 |
| storeCreateDate | Store order creation time | DateTime | 1 | UTC Time, eg: 2025-03-14 13:21:07 |
| productAmount | product amount | BigDecimal | （18,2） | Unit: $ (USD） |
| isComplete | Is the order complete? 1: Complete 0: Incomplete | Number | 1 |  |
| storageId | storage id | string | 200 | Added on 2025-11-18 |
| storageName | storage name | string | 200 | Added on 2025-11-18 |
| productList | Product List | list | 200 |  |
| - vid | Variant Id | string | 200 |  |
| - quantity | quantity | int | 20 |  |
| - sellPrice | Sell Price | BigDecimal | （18，2） | unit：$（USA） |
| - storeLineItemId | The lineItemId of your store order | string | 125 |  |
| - lineItemId | Unique ID of the order item in CJ | string | 50 |  |
| - productionOrderStatus | Production Status | Number | 1 | 1=Pending Order, 2=Pending Production, 3=In Production, 4=Production Completed, 5=Production Abnormality |
| - abnormalType | Abnormal Reason | int[] |  | 6= Image link error, 9= Production drawings don't match the renderings, 10=   Missing hanging ring, 11= Mismatch between die-cutting diagram and printing diagram, 12= uneven edges, 13= letters not connected, 14= Missing order images |
| - podPropertiesInfo | pod product order return information | Object |  |  |
| -- effectImgList | Product renderings | List | 200 |  |
| -- customResources | Finished product information | List | 200 |  |
| -- productionImgList | Production diagram | List | 200 |  |
| logisticsTimeliness | Logistics Timeliness | Object |  |  |
| - logisticsModes | Logistics List | List |  |  |
| -- logisticsName | Logistics Name | string |  | DHL Official |
| -- arrivalTime | Arrival Time (Day) | string |  | 3-7 Days |

Order Status

| Order Status | Status | remark |
| --- | --- | --- |
| CREATED | order create | create order, wait confirm |
| IN_CART | in cart | wait confirm, api merge this state |
| UNPAID | unpaid | confirm order, CJ order number create |
| UNSHIPPED | unshipped | paid, wait for sending |
| SHIPPED | shipped | in transit, get tracking number |
| DELIVERED | delivered | clients receving |
| CANCELLED | cancelled |  |

error

```
{
   "code": 1600100,
   "result": false,
   "message": "Param error",
   "data": null,
   "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

#### #Error code and Message

| Error Code | Message |
| --- | --- |
| 1600300 | order not found |
| 1600300 | orderId must be not empty |
| 1600300 | The maximum number of features is 20 |

### #1.8 Order Delete（DEL）

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/order/deleteOrder?orderId=210711100018655344

#### #CURL

```
curl --location --request DELETE 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/deleteOrder?orderId=210711100018655344' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| orderId | order id | string | Y | 200 | Query |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": "210711100018655344",
    "requestId": "721341bf-abf8-4d8c-b400-1fbdaef79039"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

error

```
{
   "code": 1600100,
   "result": false,
   "message": "Param error",
   "data": null,
   "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.9 Confirm Order（PATCH）

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/order/confirmOrder

#### #CURL

```
curl --location --request PATCH 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/confirmOrder' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "orderId": "210711100018655344"
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| orderId | order id | string | Y | 200 | Query |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": "210711100018655344",
    "requestId": "721341bf-abf8-4d8c-b400-1fbdaef79039"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

error

```
{
    "code": 1603001,
    "result": false,
    "message": "order confirm fail",
    "data": null,
    "requestId": "7dc61955-c0e8-4731-bb9b-393b4fffeaaf"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #2.0 Change Order Warehouse
- The warehouse of the orders of the platform logistics can be modified through this interface.

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/order/changeWarehouse

#### #CURL

```
curl --location 'http://localhost:8081/api2.0/v1/shopping/order/changeWarehouse' \
--header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
--header 'Content-Type: application/json' \
--data '{
    "orderCode": "123",
    "storageId": "1234"
}'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| orderCode | order code | string | Y | 200 | Query |
| storageId | storage id | string | Y | 200 | Query |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Congratulation! Well done!",
    "data": true,
    "requestId": "c627424a858444ef861484ba8d1bee48",
    "success": true
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

error

```
{
    "code": 1603001,
    "result": false,
    "message": "order query fail",
    "data": false,
    "requestId": "7dc61955-c0e8-4731-bb9b-393b4fffeaaf"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

## #2 Payment

### #2.1 Get Balance（GET）

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/pay/getBalance

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/shopping/pay/getBalance' \
                --header 'CJ-Access-Token: 0580277abfe24bcc9fccdc3ede57d334'

```

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "amount": 87247.32,
        "noWithdrawalAmount": null,
        "freezeAmount": null
    },
    "requestId": "36fc030a-a110-4318-bc83-f39f9d3e5484"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| noWithdrawalAmount | Bonus amount | BigDecimal | （18，2） | Unit: $ (USD） |
| freezeAmount | Frozen amount | BigDecimal | （18，2） | Unit: $ (USD） |
| amount | Amount | BigDecimal | （18，2） | Unit: $ (USD） |

error

```
{
   "code": 1600100,
   "result": false,
   "message": "Param error",
   "data": null,
   "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #2.2 Pay Balance（POST）

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/pay/payBalance

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/shopping/pay/payBalance' \
                --header 'CJ-Access-Token: 0580277abfe24bcc9fccdc3ede57d334' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "orderId": "12"
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| orderId | Order id | string | Y | 200 |  |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": null,
    "requestId": "7dbe69b9-dd82-4ee3-907c-a6fca833e3ce"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

error

```
{
  "code": 1600100,
  "result": false,
  "message": "Param error",
  "data": null,
  "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #2.3 Pay Balance V2（POST）

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/pay/payBalanceV2

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/shopping/pay/payBalanceV2' \
                --header 'CJ-Access-Token: 0580277abfe24bcc9fccdc3ede57d334' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "shipmentOrderId": "12",
                    "payId": "12"
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| shipmentOrderId | Shipment order Id | string | Y | 200 |  |
| payId | PayId | String | Yes | 200 |  |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": null,
    "requestId": "7dbe69b9-dd82-4ee3-907c-a6fca833e3ce"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

error

```
{
  "code": 1600100,
  "result": false,
  "message": "Param error",
  "data": null,
  "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

## #3 Shipping Info

### #3.1 Upload Shipping Info(POST)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/order/uploadWaybillInfo

> Tips:When uploading the waybill file, please submit the request in multipart/form data format.This interface can only be called after CJ order payment.

#### #CURL

```
curl --location 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/uploadWaybillInfo' \
                --header 'CJ-Access-Token:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ' \
                --form 'orderId="2511111146000642900"' \
                --form 'waybillFile=@"/C:/Users/Desktop/abcd.pdf"' \
                --form 'cjOrderId="DP2511111145580643400"' \
                --form 'cjShippingCompanyName="USPS"' \
                --form 'trackNumber="123123"'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| orderId | Order Id | string | Y | 200 |  |
| cjOrderId | CJ Order Id | string | Y | 200 |  |
| cjShippingCompanyName | CJ Shipping Company Name | string | Y | 200 | Referer:Get Storage Info, Get：logisticsBrandList |
| trackNumber | Track Number | string | Y | 200 |  |
| waybillFile | waybill document | MultipartFile | Y | 200 |  |

#### #Return

success

```
{
  "success": true,
  "message": "",
  "result": true,
  "data": true,
  "requestId": "52f1888a3b4f451d889a84218f2b50dc"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | Boolean |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

error

```
{
    "code": 806,
    "result": false,
    "message": "Warehouse “null” does not support logistics carrier “USPS”.",
    "data": null,
    "requestId": "309ad9d884ff4994b34f0da17853b970",
    "success": false
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #3.2 Update Shipping Info(POST)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/order/updateWaybillInfo

#### #CURL

```
curl --location 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/updateWaybillInfo' \
                --header 'CJ-Access-Token:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ' \
                --form 'orderId="2511111146000642900"' \
                --form 'waybillFile=@"/C:/Users/Desktop/abcd.pdf"' \
                --form 'cjOrderId="DP2511111145580643400"' \
                --form 'cjShippingCompanyName="USPS"' \
                --form 'trackNumber="123123"'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| orderId | Order Id | string | Y | 200 |  |
| cjOrderId | CJ Order Id | string | Y | 200 |  |
| cjShippingCompanyName | CJ Shipping Company Name | string | Y | 200 | Referer:Get Storage Info, Get：logisticsBrandList |
| trackNumber | Track Number | string | Y | 200 |  |
| waybillFile | waybill document | MultipartFile | Y | 200 |  |

#### #Return

success

```
{
  "success": true,
  "message": "",
  "result": true,
  "data": true,
  "requestId": "52f1888a3b4f451d889a84218f2b50dc"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | Boolean |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

error

```
{
    "code": 804,
    "result": false,
    "message": "This order does not use store platform logistics. Label upload not supported.",
    "data": null,
    "requestId": "715937dad5844ec49d51be43541eeb00",
    "success": false
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #3.3 UPDATE POD Pictures(POST)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/shopping/order/podProductCustomPicturesEdit

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/podProductCustomPicturesEdit' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --header 'platformToken: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "podPicturesEditParams": [
                        {
                            "orderCode": "123",
                            "lineItemId": "111",
                            "effectImgList": [
                                "https://oss-cf.cjdropshipping.com/product/2025/04/22/01/245e348-a87b-4196-a3a4-056f6b391301.jpg"
                            ],
                            "productionImgList": [
                                "https://oss-cf.cjdropshipping.com/product/2025/04/22/01/245e348-a87b-4196-a3a4-056f6b391301.jpg"
                            ]
                        }
                    ]
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| podPicturesEditParams |  | List | Y |  |  |
| -orderCode | CJ order id | string | Y | 200 |  |
| -lineItemId | Unique ID of the order item in CJ | string | Y | 200 |  |
| -effectImgList | Product renderings | List | Y | 200 |  |
| -productionImgList | Production diagram | List | Y | 200 |  |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Congratulation! Well done!",
    "data": {
        "list": [
            {
                "orderCode": "123",
                "lineItemId": "111",
                "result": 2,
                "failedMessage": null
            },
            {
            "orderCode": "456",
            "lineItemId": "666",
            "result": 0,
            "failedMessage": "No matching order number found"
            }
        ]
    },
    "requestId": "fa65ceae2f5740459c3e8dc8cf32124c",
    "success": true
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | Object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

data information

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| list |  | List | Y |  |
| -orderCode | CJ order id | string | 200 |  |
| -lineItemId | Unique ID of the order item in CJ | string | 200 |  |
| -result | update result 0：fail, 1: Processing, 2: success | int | 20 |  |
| -failedMessage | fail reason | string | 200 |  |

Error

```
{
    "code": 804,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "715937dad5844ec49d51be43541eeb00",
    "success": false
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | Object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |


---

# API 6 - Logistic


# #6 Logistics

## #1 Logistics

### #1.1 Freight Calculation (POST)

Freight calculation. Bulk purchase products will have designated shipping methods, while dropshipping products will usually have more options.

This is a simple mode of logistics trial calculation. If you want to use a more accurate logistics trial calculation, please use the interface:1.2 Freight Calculation Tip

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/logistic/freightCalculate

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/logistic/freightCalculate' \
                --header 'Content-Type: application/json' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --data-raw '{
                    "startCountryCode": "US",
                    "endCountryCode": "US",
                    "products": [
                        {
                            "quantity": 2,
                            "vid": "439FC05B-1311-4349-87FA-1E1EF942C418"
                        }
                    ]
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| startCountryCode | Country of origin | string | Y | 200 |  |
| endCountryCode | Country of destination | string | Y | 200 |  |
| zip | zip | string | N | 200 |  |
| taxId | tax id | string | N | 200 |  |
| houseNumber | house number | string | N | 200 |  |
| iossNumber | ioss number | string | N | 200 |  |
| quantity | Quantity | int | Y | 10 |  |
| vid | Variant id | string | Y | 200 |  |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": [
        {
            "logisticAging": "2-5",
            "logisticPrice": 4.71,
            "logisticPriceCn": 30.54,
            "logisticName": "USPS+"
        }
    ],
    "requestId": "0242ad78-eea2-481d-876a-7cf64398f07f"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| logisticPrice | Shipping cost in USD | BigDecimal | （18，2） | Unit: $ (USD） |
| logisticPriceCn | Shipping cost in CNY | BigDecimal | （18，2） | Unit: ¥ (CNY) |
| logisticAging | Shipping time | string | 20 |  |
| logisticName | Carrier name | string | 20 |  |
| taxesFee | taxes fee | BigDecimal | (18, 2) | Unit：$(USD) |
| clearanceOperationFee | customs clearance fee | BigDecimal | (18, 2) | Unit：$(USD) |
| totalPostageFee | total postage | BigDecimal | (18, 2) | Unit：$(USD) |

error

```
{
    "code": 1600100, 
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.2 Freight Calculation Tip(POST)

Freight calculation. Bulk purchase products will have designated shipping methods, while dropshipping products will usually have more options.

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/logistic/freightCalculateTip

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/logistic/freightCalculateTip' \
                --header 'Content-Type: application/json' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --data-raw '{
                    "reqDTOS": [
                        {
                            "srcAreaCode": "CN",
                            "destAreaCode": "US",
                            "length": 0.3,
                            "width": 0.4,
                            "height": 0.5,
                            "volume": 0.06,
                            "totalGoodsAmount":123.2,
                            "productProp": [
                                "COMMON"
                            ],
                            "freightTrialSkuList": [
                                {
                                    "skuQuantity": 1,
                                    "sku": "CJCF104237201AZ"
                                }
                            ],
                            "skuList": [
                                "CJCF104237201AZ"
                            ],
                            "platforms": [
                                "Shopify"
                            ]
                        }
                    ]
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| srcAreaCode | Country of origin | string | Y | 200 |  |
| destAreaCode | Country of destination | string | Y | 200 |  |
| customerCode | customer code | string | N | 200 |  |
| zip | zip | string | N | 200 |  |
| houseNumber | house number | string | N | 100 |  |
| iossNumber | ioss number | string | N | 200 |  |
| storageIdList | Storage id List | string[] | N | 100 |  |
| recipientAddress | Recipient address | string | N | 200 |  |
| city | City | string | N | 50 |  |
| recipientName | Recipient name | String | N | 200 |  |
| skuList | Sku list | String[] | Y | 200 |  |
| town | Town | String | N | 100 |  |
| phone | Phone | String | N | 50 |  |
| wrapWeight | wrap weight,Unit:g | int | Y | 200 |  |
| volume | Volume,Unit:cm³ | BigDecimal | Y | 200 |  |
| station | station | String | N | 200 | Referer:Country Code, Please use The two-letter code |
| platforms | Platform List | String[] | N | 200 | RefererPlatforms |
| dutyNo | dutyNo | String | N | 200 |  |
| email | email | String | N | 100 |  |
| province | province | String | N | 100 |  |
| recipientAddress1 | recipient address1 | String | N | 200 |  |
| uid | uid | String | N | 200 |  |
| recipientId | recipient id | String | N | 200 |  |
| recipientAddress2 | recipient address2 | String | N | 200 |  |
| amount | amount | BigDecimal | N | 50 |  |
| productTypes | product type | String[] | N |  | 0: normal goods, 1: service goods, 3: packaged goods, 4: supplier goods, 5: supplier self-delivered goods, 6: virtual goods, 7: pod personalized goods |
| weight | weight,Unit:g | int | Y | 100 |  |
| productProp | product prop | String | Y | 100 |  |
| optionName | option name | String | N | 200 |  |
| volumeWeight | volume weight,Unit:g | BigDecimal | N | 100 |  |
| orderType | order type | String | N | 100 |  |
| totalGoodsAmount | total value of goods | BigDecimal | N | 100 |  |
| freightTrialSkuList | freight trial sku list | Object[] | Y |  |  |
| - productCode | product code | String | N | 100 |  |
| - sku | sku | String | N | 100 |  |
| - productPropList | Product attributes | String[] | N | 100 |  |
| - productTypeList | product type | String[] | N |  | 0: normal goods, 1: service goods, 3: packaged goods, 4: supplier goods, 5: supplier self-delivered goods, 6: virtual goods, 7: pod personalized goods |
| - vid | variant id | String | N | 100 |  |
| - skuQuantity | sku quantity | int | N | 50 |  |
| - skuWeight | sku weight,Unit:g | BigDecimal | N | 100 |  |
| - skuVolume | sku volume,Unit:cm³ | BigDecimal | N | 100 |  |
| - combinationType | combination type | int | N | 50 |  |
| - parentVid | parent variant id | String | N | 50 |  |
| - unsalable | unsalable | int | N | 10 |  |
| - tailCostQuantity | tail cost quantity | int | N | 10 |  |
| - privateDeductionQuantity | private Ddeduction quantity | int | N | 10 |  |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": [
        {
            "arrivalTime": "12-50",
            "discountFee": 4.09,
            "discountFeeCNY": 25.30,
            "volumeWeight": null,
            "option": {
                "arrivalTime": "12-50",
                "cnName": "CJ航空挂号小包",
                "enName": "CJPacket Postal",
                "id": "1564849338719199233"
            },
            "ruleTips": [
                {
                    "expression": "^[\\s\\d\\-（）()+]{6,32}$",
                    "interceptType": "0",
                    "max": null,
                    "min": null,
                    "msgCode": "1001",
                    "msgEn": "Must be a 6-32 digit number (only numbers, symbols and spaces are supported).",
                    "type": "phone"
                }
            ],
            "ruleTipTypes": [
                "phone"
            ],
            "channelId": "1564543005939785730",
            "error": "",
            "errorEn": "",
            "optionId": "1564849338719199233",
            "postage": 3.55,
            "postageCNY": 22.00,
            "priceIncreases": "115",
            "reSort": "62",
            "remoteFee": 0,
            "remoteFeeCNY": 0,
            "tip": "",
            "uid": "",
            "orderId": null,
            "unWeightChargeTarget": null,
            "floatMaxPrice": null,
            "floatMinPrice": null,
            "logisticsParamRespDTO": null,
            "message": "Hi, CJ will not accept any disputes when you choose the shipping method, which is not trackable when orders arrived at some countries, states, or cities.",
            "wrapPostage": 4.09,
            "wrapPostageCNY": 25.30,
            "wrapWeight": 0,
            "stopWords": [],
            "channel": {
                "cnName": "促佳燕文航空挂号小包特货",
                "enName": "燕文航空挂号小包特货",
                "id": "1564543005939785730"
            },
            "cjRespDTO": {
                "postage": "3.55",
                "postageCNY": "22.00",
                "remoteFee": "0.00",
                "remoteFeeCNY": "0"
            },
            "destArea": {
                "cnName": "美国",
                "countryId": "233",
                "enName": "United States of America (the)",
                "id": "233",
                "parentId": null,
                "postCode": "",
                "shortCode": "US"
            },
            "srcArea": {
                "cnName": "中国",
                "countryId": "48",
                "enName": "China",
                "id": "48",
                "parentId": null,
                "postCode": "",
                "shortCode": "CN"
            },
            "dump": false,
            "zonePrice": [],
            "allRuleTips": [
                {
                    "expression": "^[\\s\\d\\-（）()+]{6,32}$",
                    "interceptType": "0",
                    "max": null,
                    "min": null,
                    "msgCode": "1001",
                    "msgEn": "Must be a 6-32 digit number (only numbers, symbols and spaces are supported).",
                    "type": "phone"
                }
            ],
            "taxesFee": null,
            "clearanceOperationFee": null
        }
    ],
    "requestId": "55c4708d15d44a499f061582ddbd989b",
    "success": true
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| arrivalTime | arrival time | string | 200 |  |
| discountFee | discount Fee | BigDecimal | （18，2） | Unit: $ (USD） |
| discountFeeCNY | discount Fee CNY | BigDecimal | （18，2） |  |
| volumeWeight | volume weight | BigDecimal | （18，2） | Unit: $ (USD） |
| channelId | channel id | String | 200 |  |
| error | error | String | 200 |  |
| errorEn | errorEn | String | 200 |  |
| optionId | option id | String | 100 |  |
| postage | postage | BigDecimal | （18，2） | Unit: $ (USD） |
| postageCNY | postage CNY | BigDecimal | （18，2） | Unit: $ (USD） |
| priceIncreases | price increases | String | 100 |  |
| reSort | reSort | String | 100 |  |
| remoteFee | remoteFee | BigDecimal | （18，2） | Unit: $ (USD） |
| remoteFeeCNY | remoteFee CNY | BigDecimal | （18，2） | Unit: $ (USD） |
| tip | tip | string | 200 |  |
| uid | uid | String | 200 |  |
| orderId | order id | String | 100 |  |
| unWeightChargeTarget | unWeightChargeTarget | BigDecimal | （18，2） | Unit: $ (USD） |
| floatMaxPrice | floatMaxPrice | BigDecimal | （18，2） | Unit: $ (USD） |
| floatMinPrice | floatMinPrice | BigDecimal | （18，2） | Unit: $ (USD） |
| logisticsParamRespDTO | logisticsParamRespDTO | String | 200 |  |
| message | message | String | 200 |  |
| wrapPostage | wrap postage | BigDecimal | （18，2） | Unit: $ (USD） |
| wrapPostageCNY | wrap postage CNY | BigDecimal | （18，2） | Unit: $ (USD） |
| wrapWeight | wrap weight | BigDecimal | （18，2） | Unit: $ (USD） |
| stopWords | Stop Words | String[] | 200 |  |
| channel | channel | Object |  |  |
| - cnName | name(CN) | String | 200 |  |
| - enName | name(EN) | String | 200 |  |
| - id | id | String | 200 |  |
| option | option | Object |  |  |
| - arrivalTime | arrival time | String | 100 |  |
| - cnName | name(CN) | String | 100 |  |
| - enName | name(EN) | String | 100 |  |
| - id | id | String | 100 |  |
| taxesFee | taxes fee | BigDecimal | （18，2） | Unit: $ (USD） |
| clearanceOperationFee | customs clearance fee | BigDecimal | （18，2） | Unit: $ (USD） |
| totalPostageFee | total postage | BigDecimal | (18, 2) | Unit：$(USD) |
| allRuleTips | all rule tips | object[] | 200 |  |
| - expression | expression | string | 20 |  |
| - interceptType | InterceptType | string | 20 | 0-Strong Interception 1-Non-strong Interception |
| - max | Maximum range (name, address) | string | 20 |  |
| - min | Minimum scope (name, address) | string | 20 |  |
| - msgCode | Tip code | string | 20 |  |
| - type | Type | string | 20 |  |
| - msgEn | msg(english) | string | 20 |  |
| destArea | Target Area | object | 20 |  |
| - cnName | Country name (In Chinese) | string | 20 |  |
| - enName | Country Name (English) | string | 20 |  |
| - countryId | Country Id | string | 20 |  |
| - parentId | Parent Id | string | 20 |  |
| - postCode | Post Code | string | 20 |  |
| - shortCode | Short Code | string | 20 |  |
| - id | id | string | 20 |  |
| srcArea | Source Area | object | 20 |  |
| - cnName | Country name (In Chinese) | string | 20 |  |
| - enName | Country Name (English) | string | 20 |  |
| - countryId | Country Id | string | 20 |  |
| - parentId | Parent Id | string | 20 |  |
| - postCode | Post Code | string | 20 |  |
| - shortCode | Short Code | string | 20 |  |
| - id | id | string | 20 |  |

error

```
{
    "code": 1600100, 
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #1.3 Supplier self-shipment logistics trial calculation(POST)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/logistic/getSupplierLogisticsTemplate

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/logistic/getSupplierLogisticsTemplate' \
                --header 'Content-Type: application/json' \
                 --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                 --data-raw '{
                    "skuList": ""
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| skuList | Product SPU | String[] | 是 | 200 |  |

#### #Response

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": [
        {
            "skuList": [],
            "logisticsInfoList": [
                {
                    "id": "123",
                    "logisticsName": "fdd",
                    "postage": "",
                    "startCountryCode": "",
                    "destCountryCode": ""
                }
            ]
        }
    ],
    "requestId": "0242ad78-eea2-481d-876a-7cf64398f07f"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| skuList | SPU List | String[] |  |  |
| logisticsInfoList | logistics Information | Object[] |  |  |
| - id | Template Id | string | 100 |  |
| - logisticsName | Logistics Name | string | 200 |  |
| - postage | Postage Fee | BigDecimal | (18,2) | Unit：$(USD) |
| - startCountryCode | Start Country Code | string | 100 |  |
| - destCountryCode | Target Country Code | string | 100 |  |

error

```
{
    "code": 1600100, 
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

## #2 Tracking Number

### #2.1  Get Tracking Information (GET)Deprecated

Shipping information can be found upon tracking numbers. You can also visitCJ Logistic Platform(opens new window)

> Has deprecated on June 1, 2024, Please use the new apiGet Tracking Information

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/logistic/getTrackInfo?trackNumber=CJPKL7160102171YQ

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/logistic/getTrackInfo?trackNumber=CJPKL7160102171YQ
                                                                                                    &trackNumber=CJPKL7160102171YQ
                                                                                                    &trackNumber=CJPKL7160102171YQ
                                                                                                    &trackNumber=CJPKL7160102171YQ

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| trackNumber | trackNumber | string | Y | 200 | batch query |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": [
        {
            "trackingNumber": "CJPKL7160102171YQ",
            "logisticName": "CJPacket Sensitive",
            "trackingFrom": "CN",
            "trackingTo": "US",
            "deliveryDay": "13",
            "deliveryTime": "2021-06-17 07:04:04",
            "trackingStatus": "In transit",
            "lastMileCarrier": "CJPacket",
            "lastTrackNumber": "926112903032124"
        }
    ],
    "requestId": "3426e927-8c50-4687-9ced-623e77d55bd0"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| trackingNumber | tracking number | string | 200 |  |
| trackingFrom | from | string | 20 |  |
| trackingTo | to | string | 20 |  |
| deliveryDay | Delivery day | string | 200 |  |
| deliveryTime | Delivery time | string | 200 |  |
| trackingStatus | tracking status | string | 200 |  |
| lastMileCarrier | last mile carrier | string | 200 |  |
| lastTrackNumber | last mile tracking number | string | 200 |  |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1" 
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

### #2.2 Get Tracking Information (GET)

Shipping information can be found upon tracking numbers. You can also visitCJ Logistic Platform(opens new window)

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/logistic/trackInfo?trackNumber=CJPKL7160102171YQ

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/logistic/trackInfo?trackNumber=CJPKL7160102171YQ
                                                                                                    &trackNumber=CJPKL7160102171YQ
                                                                                                    &trackNumber=CJPKL7160102171YQ
                                                                                                    &trackNumber=CJPKL7160102171YQ

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| trackNumber | trackNumber | string | Y | 200 | batch query |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": [
        {
            "trackingNumber": "CJPKL7160102171YQ",
            "logisticName": "CJPacket Sensitive",
            "trackingFrom": "CN",
            "trackingTo": "US",
            "deliveryDay": "13",
            "deliveryTime": "2021-06-17 07:04:04",
            "trackingStatus": "In transit",
            "lastMileCarrier": "CJPacket",
            "lastTrackNumber": "926112903032124"
        }
    ],
    "requestId": "3426e927-8c50-4687-9ced-623e77d55bd0"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| trackingNumber | tracking number | string | 200 |  |
| trackingFrom | from | string | 20 |  |
| trackingTo | to | string | 20 |  |
| deliveryDay | Delivery day | string | 200 |  |
| deliveryTime | Delivery time | string | 200 |  |
| trackingStatus | tracking status | string | 200 |  |
| lastMileCarrier | last mile carrier | string | 200 |  |
| lastTrackNumber | last mile tracking number | string | 200 |  |

error

```
{
    "code": 1600100,
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1" 
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |


---

# API 7 - Dispute


# #7 Dispute

## #1 Select the list of disputed products（GET）

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/disputes/disputeProducts

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/disputes/disputeProducts?orderId=CJPKL7160102171YQ' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| orderId | CJ order id | string | Y | 100 |  |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "orderId": "75727832844206081",
        "orderNumber": "1627572766607937536",
        "productInfoList": [
            {
                "lineItemId": "27572784056172547",
                "cjProductId": "70030020423733248",
                "cjVariantId": "70030020612476928",
                "canChoose": true,
                "price": 23.00,
                "quantity": 1,
                "cjProductName": "Hellpoo",
                "cjImage": "http://d847fcac-392f-4168-8b06-a580a8368dff.jpg",
                "sku": "CJSJ1041743",
                "supplierName": "banggood"
            }
        ]
    },
    "requestId": "11edc6cc84254bb4b3ac74299d5db197",
    "success": true
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| orderId | CJ order id | string | 200 |  |
| orderNumber | customer order number | string | 200 |  |
| productInfoList | Product information list | Object[] |  |  |
| lineItemId | lineItem id | string | 100 |  |
| cjProductId | CJ product id | string | 100 |  |
| cjVariantId | CJ variant id | string | 100 |  |
| canChoose | Is it possible to check to open a dispute | boolean |  | true:yes, false：no |
| price | product price | BigDecimal | (18,2) | Unit: $ (USD） |
| quantity | quantity | integer | 20 |  |
| cjProductName | CJ product name | string | 200 |  |
| cjImage | CJ product image | string | 100 |  |
| sku | sku | string | 100 |  |
| supplierName | supplier name | string | 200 |  |

error

```
{
    "code": 1600100, 
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

## #2 Confirm the dispute（POST）

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/disputes/disputeConfirmInfo

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/disputes/disputeConfirmInfo' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --data-raw '{
                    "orderId": "62650625018974208",
                    "productInfoList": [
                        {
                            "lineItemId": "1626506252349808640",
                            "quantity": "1"
                        }
                      ]
                    }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| orderId | CJ order id | string | Y | 100 |  |
| productInfoList | product information | object[] | Y |  |  |
| lineItemId | lineItem id | string | N |  |  |
| quantity | quantity | integer | Y |  |  |
| price | price | BigDecimal | Y | (18,2) | Unit: $ (USD） |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": {
        "orderId": "265062501897420801",
        "orderNumber": "1626506237791440896",
        "maxProductPrice": 23.00,
        "maxPostage": 0.00,
        "maxIossTaxAmount": 0,
        "maxIossHandTaxAmount": 0,
        "maxAmount": 23.00,
        "expectResultOptionList": [
            "1"
        ],
        "productInfoList": [
            {
                "lineItemId": "1626506252349808640",
                "cjProductId": "1570030020423733248",
                "cjVariantId": "1570030020612476928",
                "canChoose": false,
                "price": 23.00,
                "quantity": 1,
                "cjProductName": "Hellpoo",
                "cjImage": "https://d847fcac-392f-4168-8b06-a580a8368dff.jpg",
                "sku": "CJSJ1041743-A",
                "supplierName": "banggood"
            }
        ],
        "disputeReasonList": [
            {
                "disputeReasonId": 1,
                "reasonName": "Unfulfilled Order Cancellation"
            }
        ]
    },
    "requestId": "af336b7bdc364e6391b9d558690b1521",
    "success": true
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| orderId | CJ order id | string | 200 |  |
| orderNumber | customer order number | string | 200 |  |
| expectResultOptionList | expected result | string[] |  | 1: Refund , 2:Reissue |
| maxProductPrice | Product price | BigDecimal | (18,2) | Unit: $ (USD） |
| maxPostage | Postage | BigDecimal | (18,2) | Unit: $ (USD） |
| maxIossTaxAmount | ioss tax amount | BigDecimal | (18,2) | Unit: $ (USD） |
| maxIossHandTaxAmount | ioss tax fee amount | BigDecimal | (18,2) | Unit: $ (USD） |
| maxAmount | Apply for refund amount | BigDecimal | (18,2) | Unit: $ (USD） |
| productInfoList | product information | Object[] |  |  |
| canChoose | Whether to check open dispute | boolean | 2 | false or ture |
| price | price | BigDecimal | (18,2) | Unit: $ (USD） |
| quantity | quantity | integer | 20 |  |
| lineItemId | lineItem id | string | 100 |  |
| cjProductId | CJ product id | string | 100 |  |
| cjVariantId | CJ variant id | string | 100 |  |
| cjProductName | CJ product name | string | 200 |  |
| cjImage | CJ product image | string | 100 |  |
| sku | CJ sku | string | 100 |  |
| supplierName | supplier name | string | 200 |  |
| disputeReasonList | dispute reason | object [] |  |  |
| disputeReasonId | dispute reason id | integer | 20 |  |
| reasonName | dispute reason name (EN) | string | 200 |  |

error

```
{
    "code": 1600100, 
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

## #3 Create dispute（POST）

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/disputes/create

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/disputes/create' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                 --data-raw '{
                    "orderId": "275727832844206081",
                    "businessDisputeId": "0000001266",
                    "disputeReasonId": 1,
                    "expectType": 1,
                    "refundType": 1,
                    "messageText": "gfhfghfghfgh",
                    "imageUrl": [],
                    "productInfoList": [
                        {
                            "lineItemId": "1627572784056172547",
                            "quantity": "1"
                        }
                    ]
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| businessDisputeId | customer business id, 唯一值 | string | Y | 100 |  |
| orderId | CJ order id | string | Y | 100 |  |
| disputeReasonId | dispute reason id | integer | Y | 10 |  |
| expectType | expect type | integer | Y | 20 | 1: Refund , 2:Reissue |
| refundType | Refund type | integer | Y | 20 | 1:balance , 2：platform |
| messageText | text message | string | Y | 500 |  |
| imageUrl | image url | string [] | N | 200 |  |
| videoUrl | video url | string [] | N | 200 |  |
| productInfoList | product information | object[] |  |  |  |
| price | price | BigDecimal | Y | (18,2) | Unit: $ (USD） |
| lineItemId | lineItem id | string | N | 100 |  |
| quantity | quantity | integer | Y | 10 |  |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": "true",
    "redirectUri": "0242ad78-eea2-481d-876a-7cf64398f07f"
}

```

error

```
{
    "code": 1600100, 
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

## #4 Cancel dispute（post）

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/disputes/cancel

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/disputes/cancel' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                 --data-raw '{
                        "orderId": "J1623672949997490176",
                        "disputeId": "SH1623673863466725376"
                    }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| orderId | CJ order id | string | Y | 100 |  |
| disputeId | CJ dispute id | string | Y | 100 |  |

#### #返回

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": "true",
    "redirectUri": "0242ad78-eea2-481d-876a-7cf64398f07f"
}

```

error

```
{
    "code": 1600100, 
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

## #5 Query the list of disputes（GET）

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/disputes/getDisputeList

#### #CURL

```
curl --location --request GET 'https://developers.cjdropshipping.com/api2.0/v1/disputes/getDisputeList' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| orderId | CJ order id | string | N | 100 |  |
| disputeId | dispute id | integer | N | 10 |  |
| orderNumber | customer order number | string | N | 100 |  |
| pageNum | page number | integer | N | 10 | default: 1 |
| pageSize | page size | integer | N | 10 | default: 10 |

#### #Return

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": "",
    "redirectUri": "0242ad78-eea2-481d-876a-7cf64398f07f"
}

```

| 返回字段 | 字段意思 | 字段类型 | 长度 | 备注 |
| --- | --- | --- | --- | --- |
| pageNum | page number | int | 20 |  |
| pageSize | page size | int | 20 |  |
| total | total | int | 20 |  |
| list |  | List |  |  |
| status | dispute status | string | 20 |  |
| id | dispute id | string |  |  |
| disputeReason | dispute reason | string |  |  |
| replacementAmount | Reissue amount | BigDecimal | (18,2) | Unit: $ (USD） |
| resendOrderCode | Reissue order id | string |  |  |
| money | final refund amount | BigDecimal | (18,2) | Unit: $ (USD） |
| finallyDeal | final negotiation result | integer |  | 1:Refund, 2: Reissue, 3: Reject |
| createDate | create date |  |  |  |
| productList | product information | Object[] |  |  |
| image | product image | string |  |  |
| price | product price |  |  |  |
| lineItemId | lineItem id | string | 100 |  |
| cjProductId | CJ product id | string |  |  |
| cjVariantId | CJ variant id | string | 100 |  |
| productName | product name | string |  |  |
| supplierName | supplier name | string |  |  |

error

```
{
    "code": 1600100, 
    "result": false,
    "message": "Param error",
    "data": null,
    "requestId": "323fda9d-3c94-41dc-a944-5cc1b8baf5b1"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |


---

# API 8 - Webhook


# #08. Webhook

## #1 Setting

#### #Webhook Configuration Requirements
- Supported Protocols: HTTPS
- Encryption: TLS 1.2 or TLS 1.3 recommended for secure transmission
- Request Method: POST
- Content Type:Content-Type: application/json
- Success Status Code:200 OK
- Timeout: Response must be returned within3 seconds(Avoid long-running or complex business logic to ensure prompt response)

### #1.1 Message Setting（POST）

#### #URL

https://developers.cjdropshipping.com/api2.0/v1/webhook/set

#### #CURL

```
curl --location --request POST 'https://developers.cjdropshipping.com/api2.0/v1/webhook/set' \
                --header 'CJ-Access-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxx' \
                --header 'Content-Type: application/json' \
                --data-raw '{
                    "product": {
                        "type": "ENABLE",
                        "callbackUrls": [
                            "https://your-host/api2.0/"
                        ]
                    },
                    "stock": {
                        "type": "ENABLE",
                        "callbackUrls": [
                            "https://your-host/api2.0/"
                        ]
                    },
                    "order": {
                        "type": "ENABLE",
                        "callbackUrls": [
                            "https://your-host/api2.0/"
                        ]
                    },
                    "logistics": {
                        "type": "ENABLE",
                        "callbackUrls": [
                            "https://your-host/api2.0/"
                        ]
                    }
                }'

```

| Parameter | Definition | Type | Required | Length | Note |
| --- | --- | --- | --- | --- | --- |
| product | Product Message | object | Y | 200 | Product Message Setting |
| - type | Product Message type | string | Y | 200 | ENABLE，CANCEL |
| - callbackUrls | callback url | string[] | Y | 1 |  |
| stock | Stock Message | object | Y | 200 | Stock Message Setting |
| - type | Stock Message type | string | Y | 200 | ENABLE，CANCEL |
| - callbackUrls | callback url | string[] | Y | 1 |  |
| order | Order Message | object | Y | 200 | Order Message Setting |
| - type | Message type | string | Y | 200 | ENABLE，CANCEL |
| - callbackUrls | callback url | string[] | Y | 1 |  |
| logistics | Logistics Message | object | Y | 200 | Logistics Message Setting |
| - type | Message type | string | Y | 200 | ENABLE，CANCEL |
| - callbackUrls | callback url | string[] | Y | 1 |  |

#### #Result

success

```
{
    "code": 200,
    "result": true,
    "message": "Success",
    "data": true,
    "requestId": "97367e0f-cf3a-4c9b-acea-a36fb56f81b8"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

error

```
{
    "code": 1601000,
    "result": false,
    "message": "User not find",
    "data": null,
    "requestId": "a18c9793-7c99-42f9-970b-790eecdceba2"
}

```

| Field | Definition | Type | Length | Note |
| --- | --- | --- | --- | --- |
| code | error code | int | 20 | Reference error code |
| result | Whether or not the return is normal | boolean | 1 |  |
| message | return message | string | 200 |  |
| data | return data | object |  | interface data return |
| requestId | requestId | string | 48 | Flag request for logging errors |

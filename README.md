# minesweeper-node-server

**Api Doc**
====

**New Board**
----
  Creates a new minesweeper board with default dimensions and mine count

* **URL**
  /new

* **Method:**
  `POST`

*  **URL Params**
   None

* **Data Params**
  None

* **Success Response:**
  * **Code:** 201<br />
    **Content:** `{ boardId: xxxxxxxx, x: 20, y: 20, mines: 40}`

* **Error Response:**
  * **Code:** 422 Unprocessable Entity<br />
    **Content:** `{ error : "server memory full" }`


* **Sample Call:**

  ```javascript
    $.post('//localhost:7778/new', function(data) {
		boardId = data.boardId
	})
  ```

----------
**Move / Take a step**
----
  Posts the next move on the board

* **URL**
  /boardId/:boardId/x/:x/y/:y

* **Method:**
  `POST`

*  **URL Params (Required):**
   `boardId=[string]`
   `x=[integer]`
   `y=[integer]`

* **Data Params**
  None

* **Success Response:**
  * **Code:** 200<br />
    **Content:** `{ finished: true }`
OR
  * **Code:** 200<br />
    **Content:** `{ blown: true }`


* **Error Response:**
  * **Code:** 404 NOT FOUND <br />
    **Content:** `{ error : "unknown id" }`

* **Sample Call:**
  ```javascript
    $.post('//localhost:7778/boardId/id/x/1/y/2', function (data) {
		if (!data.blown) {
			....
		}
	})
  ```


----------
**Get Board**
----
  Returns json board data

* **URL**
  /boardId/:boardId

* **Method:**
  `GET`

*  **URL Params**
   **Required:**

   `boardId=[string]`

* **Data Params**
  None

* **Success Response:**
  * **Code:** 200 <br />
    **Content:** `{ finished : true, board : array(array()) }`

* **Error Response:**
  * **Code:** 404 NOT FOUND <br />
    **Content:** `{ error : "unknown id" }`

* **Sample Call:**
  ```javascript
    $.get('//localhost:7778/boardId/x', function (data){
	    ...
	})
  ```

----------
**Delete Board**
----
  Delete a board when game is over (finished or step on a mine)

* **URL**
  /boardId/:boardId

* **Method:**
  `DELETE`

*  **URL Params**
   **Required:**

   `boardId=[string]`

* **Data Params**
  None

* **Success Response:**
  * **Code:** 200 <br />
    **Content:** `{ deleted : boardId }`

* **Error Response:**
  * **Code:** 404 NOT FOUND <br />
    **Content:** `{ error : "unknown id" }`

* **Sample Call:**
  ```javascript
    jQuery.ajax({
		url: '//localhost:7778/boardId/x',
		type: 'DELETE'
	})
  ```

----------

**License**

Copyright (c) 2017-2017 Alexandru-Dan Fratean

All rights reserved.

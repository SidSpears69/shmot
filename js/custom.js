$(document).ready(function () {

    // Daterangepicker.js
    $('#search-date').daterangepicker({
        timeZone: "Russia/Moscow",
        startDate: new Date(),
        timePicker: true,
        timePicker24Hour: true,
        timePickerIncrement: 30,
        locale: {
            format: 'DD.MM.YYYY HH:mm',
            applyLabel: 'Принять',
            cancelLabel: 'Отмена',
            invalidDateLabel: 'Выберите дату',
            daysOfWeek: ['Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс', 'Пн'],
            monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            firstDay: 1
        }
    });

    // Datatable.js
    var table = $("#table-order").DataTable({
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/orders.php",
            "type": "POST",
            "dataSrc": function (json) {
                console.log(json)
                return json.data;
            }
        },
        "columns": [
            {
                "class": "details-control",
                "orderable": false,
                "data": null,
                "defaultContent": ""
            },
            {
                "class": "number-order",
                "data": "number",
                render: function (data) {
                    return "№ " + data;
                }
            },
            {
                "class": "user-link",
                "data": "social",
                render: function (data) {
                    return "<a href=" + data + ">@" + cutLink(data, $("social-list")) + "</a>";
                }
            },
            {
                "class": "weight-value",
                "data": "weight"
            },
            {
                "class": "track-value",
                "data": "track"
            },
            {
                "data": "source",
                render: function (data) {
                    return "<a href='" + data.source + "'>" + data.type + "</a>";
                }
            },
            {
                "class": "status-order",
                "data": "status",
                render: function (data) {
                    return mappingStatuses(data);
                }
            },
            {
                "data": "progress",
                render: function (data) {
                    return "<div class='progress'><div class='progress-bar bg-primary progress-bar-striped' role='progressbar' aria-valuenow=" + data.current + " aria-valuemin='" + data.min + "' aria-valuemax='" + data.max + "' style='width:" + data.current + "%' aria=label='" + data.current + "%'></div></div>";
                }
            },
            {
                "class": "prepayment",
                "data": "prepayment",
                render: function (data) {
                    return data + " руб";
                }
            },
            {
                "class": "price",
                "data": "price",
                render: function (data) {
                    return data + " руб";
                }
            },
            {
                "class": "date-order",
                "data": "date order"
            },
            {
                "data": {
                    "link_view": "link_view",
                    "link_edit": "link_edit"
                },
                render: function (data) {
                    return "<a href='" + data.link_edit + "' class='btn btn-primary mr-1'><i class='fas fa-edit' aria-hidden='true'></i><span class='sr-only'>Редактировать</span></a><a href='" + data.link_view + "' class='btn btn-primary ml-1'><i class='fas fa-search-plus' aria-hidden='true'></i><span class='sr-only'>Посмотреть</span></a>"
                }
            },
        ],
        "order": [[1, 'asc']],
        "responsive": true,
        "autoWidth": false,
        "bSort": false,
        "bFilter": false,
        "lengthChange": false,
        "drawCallback": function () {
            findFullPrepayment($(this));
        },
        "language": {
            "processing": "Подождите...",
            "search": "Поиск:",
            "lengthMenu": "Показать _MENU_ записей",
            "info": "Записи с _START_ до _END_ из _TOTAL_ записей",
            "infoEmpty": "Записи с 0 до 0 из 0 записей",
            "infoFiltered": "(отфильтровано из _MAX_ записей)",
            "infoPostFix": "",
            "loadingRecords": "Загрузка записей...",
            "zeroRecords": "Записи отсутствуют.",
            "emptyTable": "В таблице отсутствуют данные",
            "paginate": {
                "first": "Первая",
                "previous": "Предыдущая",
                "next": "Следующая",
                "last": "Последняя"
            },
            "aria": {
                "sortAscending": ": активировать для сортировки столбца по возрастанию",
                "sortDescending": ": активировать для сортировки столбца по убыванию"
            },
            "select": {
                "rows": {
                    "_": "Выбрано записей: %d",
                    "0": "Кликните по записи для выбора",
                    "1": "Выбрана одна запись"
                }
            }
        },
    });

    // Detail Rows от Datatable
    var detailRows = [];
    $('#table-order tbody').on('click', 'tr td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row(tr);
        var content = $.inArray(tr.attr('id'), detailRows);
        if (row.child.isShown()) {
            tr.removeClass('details');
            row.child.hide();
            detailRows.splice(content, 1);
        }
        else {
            tr.addClass('details');
            row.child(outputDetails(row.data())).show();
            if (content === -1) {
                detailRows.push(tr.attr('id'));
            }
        }
    });
    table.draw(function () {
        $.each(detailRows, function (item, id) {
            $('#' + id + ' td.details-control').trigger('click');
        });
    });

    // Вывод детальной информации
    function outputDetails(data) {
        var detailInformation = "";
        for (key in data.detail) {
            var value = data.detail[key].value;
            var result = "";
            if (key == "products" || key == "notes") {
                result += "<ol>";
                if (key == "products") {
                    value.forEach(function (item) {
                        result += "<li><a href='" + item.link_articule + "'>" + item.articule + "</a> <a href='" + item.link_name + "'>" + item.name + "</a> " + item.size + " " + item.color + " " + item.status + "</li>";
                    })
                }
                else {
                    value.forEach(function (item) {
                        result += "<li>" + item.created_at + " " + item.msg + " <span class='badge badge-info'>" + item.type + "</span></li>";
                    })
                }
                result += "</ol>";
            }
            else {
                result = "<p>" + value + "</p>";
            }
            detailInformation += "<div><h3 class='h5'>" + data.detail[key].title + "</h3>" + result + "</div>";

        }
        return detailInformation;
    }

    // Обрезка ссылки до последней части
    function cutLink(link) {
        var result;
        if (link[link.length - 1] == "/") {
            result = link.substr(0, link.length - 1);
        }
        else {
            result = link;
        }
        var splitResult = result.split("/");
        return splitResult[splitResult.length - 1];
    }

    // Словарь статусов
    var statuses = {
        'new': 'Новый',
        'purchases': 'В закупке',
        'manned': 'Укомплектован',
        'shipped': 'Отправлен',
        'received': 'Получен'
    };

    // Маппирование статуса
    function mappingStatuses(status) {
        return statuses[status];
    }


    // Получение прогресса
    // function mappingProgress(status) {
    //   var length = Object.keys(statuses).length;
    //   var indexElement;
    //   var indexItem = Object.keys(statuses).some(function (key, index) {
    //     if (statuses[key] == statuses[status]) {
    //       indexElement = index;
    //       return;
    //     };
    //   });
    //   return 100 / (length - 1) * indexElement;
    // }


    // Поиск полной предоплаты
    function findFullPrepayment(table) {
        table.children("tbody").children("tr").each(function () {
            var prepayment = $(this).children(".prepayment");
            var price = $(this).children(".price");
            if (prepayment.text() == price.text()) {
                prepayment.addClass("bg-success");
                price.addClass("bg-success");
            }
        });
    }


    // Поиск по Datatables(возможно рефакторинг)
    $("#search-name").change(function () {
        table.columns($(".details-control")).search(this.value).draw();
    })
    $("#reservation").change(function () {
        table.columns($(".date-order")).search(this.value).draw();
    })
    $("#search-number").change(function () {
        table.columns($(".number-order")).search(this.value).draw();
    })
    $("#search-username").change(function () {
        findClientSocial();
    })
    $("#social-list").change(function () {
        if ($("#search-username").val()) {
            findClientSocial();
        }
    })
    $("#search-weight").change(function () {
        table.columns($(".weight-value")).search(this.value).draw();
    })
    $("#search-track").change(function () {
        table.columns($(".track-value")).search(this.value).draw();
    })
    $("#full-purchased").change(function () {
        table.columns($(".status-order")).search(this.value).draw();
    })
    $("#status-list").change(function () {
        table.columns($(".status-order")).search(this.value).draw();
    })

    //Поиск социальной сети клиента
    function findClientSocial() {
        var social = synchronizeSocialInput($("#search-username"), $("#social-list"));
        var value = {
            "social_type": social.socialName,
            "social": social.socialLink
        }
        table.columns($(".user-link")).search(value).draw();
    }

    // Синхронизация выбора и поля ввода социальной сети
    function synchronizeSocialInput(input, select) {
        var value = input.val();
        var userName = cutLink(value);
        var selectOption = select.find("option");
        var socialName = select.find('option:selected').text();
        var socialLink = select.val() + userName;
        var result = $.makeArray(selectOption).some(function (item) {
            if ($(item).val().split(userName)[0] == value.split(userName)[0]) {
                $(item).prop("selected", true);
                return true;
            }
        });
        return {
            socialName: socialName,
            socialLink: socialLink,
            userName: userName,
            isSimilar: result
        }
    }

    // Управление select социальной сети
    function toggleSocialSelect(input) {
        var select = input.closest(".input-group").prev("select");
        input.on("keyup change paste click", function () {
            checkSimilarValue($(this), select);
        })
        checkSimilarValue(input, select);
    }

    // Включение/Отключение select социальной сети
    function checkSimilarValue(input, select) {
        if (synchronizeSocialInput(input, select).isSimilar) {
            select.prop("disabled", true);
        }
        else {
            select.prop("disabled", false);
        }
    }

    // Для страницы заказов
    if ($("#search-username").length > 0) {
        toggleSocialSelect($("#search-username"));
    }

    // Маска телефонных номеров
    $("input[type=tel]").inputmask("+7 (999) 999-9999");

    // Добавление новой записи в таблицу
    $("#add-client").click(function () {
        var that = $(this);
        if ($("#card-username").val()) {
            createNewSocial(that);
            createClientArray();
        }
        else {
            $("#add-client-error").remove();
            $(this).closest("fieldset").after("<span class='invalid-feedback d-block' id='add-client-error' role='alert'>Заполните ник клиента</span>");
        }
    })

    // Создание новой записи в таблице социальных сетей
    function createNewSocial(that) {
        $("#add-client-error").remove();
        var social = synchronizeSocialInput($("#card-username"), $("#card-social-list"));
        if (findSimilarRecord(social.socialLink)) {
            that.closest("fieldset").after("<span class='invalid-feedback d-block' id='add-client-error' role='alert'>Уже есть запись</span>");
        }
        else {
            $("#table-clients tbody").append("<tr><td>" + social.socialName + "</td><td><a href=" + social.socialLink + ">" + social.userName + "</a></td><td><button type='button' class='btn btn-danger w-100'>Удалить</button></td></tr>");
            deleteTableRecord($("#table-clients"), createClientArray);
        }
    }

    //Проверка на уже присутсвующую запись
    function findSimilarRecord(socialLink) {
        var result = false;
        $("#table-clients a").each(function () {
            if ($(this).attr("href") == socialLink) {
                result = true;
            }
        })
        return result;
    }

    // Для страницы карточки клиента
    if ($("#card-username").length > 0) {
        toggleSocialSelect($("#card-username"));
    }

    // Удаление записи в таблице
    function deleteTableRecord(table, createArray, callback) {
        table.find(".btn-danger").each(function () {
            $(this).unbind("click");
            $(this).click(function () {
                if (confirm("Вы уверены?")) {
                    $(this).closest("tr").remove();
                    createArray();
                }
                if (callback) {
                    callback();
                }

            })
        })
    }
    deleteTableRecord($("#table-clients"), createClientArray);

    // Подготовка данных таблицы социальных сетей для отправки(возможно рефакторинг)
    function createClientArray() {
        var clientArray = [];
        $("#table-clients tbody tr").each(function () {
            var client = {
                social_type: $($(this).find("td")[0]).text(),
                social: $($(this).find("td")[1]).find("a").attr("href")
            }
            clientArray.push(client);
        })
        $("#client-social").val(JSON.stringify(clientArray));
    }
    createClientArray();

    // Select2.js 
    $('.select2').select2({
        allowClear: true
    });

    // Datetimipicker.js
    $('#date-order').datetimepicker({
        language: "ru",
        icons: {
            time: 'fa fa-clock',
        }
    });

    // Добавление нового товара в таблицу заказов
    $("#article-order").change(function () {
        if ($(this).val()) {
            var selectedOption = $(this).find("option:selected");
            $("#table-product tbody").append("<tr><td><a href='/content/"
                + selectedOption.data("article") + "'>" + selectedOption.data("article") + "</a></td><td><a href='"
                + selectedOption.data("link") + "'>" + selectedOption.val() + "</a></td><td class='price-order'>"
                + selectedOption.data("price")
                + "</td><td><button type='button' class='btn btn-danger w-100'>Удалить</button></td></tr>");
            deleteTableRecord($("#table-product"), createOrderArray, sumProductsPrice);
            sumProductsPrice();
            createOrderArray();
        }
    })

    // Подсчет стоимости заказа
    function sumProductsPrice() {
        var result = 0;
        $(".price-order").each(function () {
            result += parseInt($(this).text());
        })
        $("#sum-price").text(result);
    }
    sumProductsPrice();
    deleteTableRecord($("#table-product"), createOrderArray, sumProductsPrice);

    // Подготовка данных таблицы заказов для отправки(возможно рефакторинг)
    function createOrderArray() {
        var orderArray = [];
        $("#table-product tbody tr").each(function () {
            var order = {
                articule: $($(this).find("td")[0]).text(),
                link_articule: $($(this).find("td")[0]).find("a").attr("href"),
                name_order: $($(this).find("td")[1]).text(),
                name_order_link: $($(this).find("td")[1]).find("a").attr("href"),
            }
            orderArray.push(order);
        })
        $("#products-order").val(JSON.stringify(orderArray));
    }
    createOrderArray();

    // Добавление нового товара в таблицу заказов на странице редактирования 
    $("#article-order-edit").change(function () {
        if ($(this).val()) {
            var selectedOption = $(this).find("option:selected");
            $("#table-edit-order tbody").append("<tr><td><a href='/content/"
                + selectedOption.data("article") + "'>" + selectedOption.data("article") + "</a></td><td><a href='"
                + selectedOption.data("link") + "'>" + selectedOption.val() + "</a></td><td class='price-order'>"
                + selectedOption.data("price") + "</td><td>"
                + selectedOption.data("status")
                + "</td><td><button type='button' class='btn btn-danger w-100'>Удалить</button></td></tr>");
            deleteTableRecord($("#table-edit-order"), createOrderEditArray, sumProductsPrice);
            sumProductsPrice();
            createOrderEditArray();
        }
    })

    // Добавление комментария
    $("#comments-order").change(function () {
        var date = new Date();
        $("#comments").append("<li>" + date.toLocaleDateString('ru') + " " + $(this).val() + "</li>");
        createOrderEditArray();
    })

    // Подготовка данных страницы редактирования заказа для отправки на сервер
    function createOrderEditArray() {
        var orderArray = [];
        var commentsArray = [];
        $("#comments li").each(function () {
            commentsArray.push($(this).text());
        })
        $("#table-edit-order tbody tr").each(function () {
            var order = {
                articule: $($(this).find("td")[0]).text(),
                link_articule: $($(this).find("td")[0]).find("a").attr("href"),
                name_order: $($(this).find("td")[1]).text(),
                name_order_link: $($(this).find("td")[1]).find("a").attr("href"),
                status: $($(this).find("td")[2]).text(),
            }
            orderArray.push(order);
        })
        var result = {
            products: orderArray,
            notes: commentsArray
        }
        $("#products-order-edit").val(JSON.stringify(result));
    }
    createOrderEditArray();

    //Поиск по артикулу
    $("#search-article").change(function () {
        var value = $(this).val();
        $("#content-items").empty();
        ajaxRequest(value);
    })

    //Ajax запрос на обновление контента
    function ajaxRequest(value) {
        $.ajax({
            method: "POST",
            url: 'content.php',
            data: { "value": value },
            success: function (responce) {
                var result = JSON.parse(responce);
                $.each(result, function (index, value) {
                    $("#content-items").append(drawContent(value));
                });
            }
        });
    }

    // Отрисовка нового контента
    function drawContent(content) {
        if ($("#template-content").length > 0) {
            var template = $("#template-content")[0].content.cloneNode(true);
        }
        $(template).find("img").prop("src", content.img);
        $(template).find("img").prop("alt", content.name);
        $(template).find(".name-content").text(content.articule + " " + content.name + " " + content.size);
        $(template).find(".price-purchase-content").text(content.purchase_price);
        $(template).find(".price-content").text(content.price);
        $(template).find("a.btn-primary").attr(("href"), function () {
            return this + content.id;
        });
        $(template).find("a.btn-danger").attr(("href"), function () {
            return this + content.id;
        });
        deleteContent();
        return template;
    }

    // Удаление контента
    function deleteContent() {
        $("#content-items").find(".btn-danger").each(function () {
            $(this).unbind("click");
            $(this).click(function (evt) {
                evt.preventDefault();
                var value = cutLink($(this).attr("href"));
                if (confirm("Вы уверены?")) {
                    $(this).closest(".content-item").remove();
                    $.ajax({
                        method: "DELETE",
                        url: 'content.php',
                        data: { "value": value }
                    });
                }
            })
        })
    }
    deleteContent();

    // Бесконечный скролл
    var value = 0;
    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
            value++;
            ajaxRequest(value);
        }
    })
    // Загрузка контента
    var emptyImg = $(".img-content").attr("src");
    $("#add-file").change(function() {
        var that = $(this);
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function () {
            $("#add-content-error").remove();
            $(".img-content").attr("src", reader.result);
            $("#add-file").prop("disabled", true);
            that.prev("label").addClass("disabled");
        };
        reader.readAsDataURL(file);
    })

    // Удаление загруженного контента
    $("#add-content").find(".btn-danger").click(function(){
        if (confirm("Вы уверены?")) {
        var input = $("#add-file");
        input.val("");
        input.prop("disabled", false);
        input.prev("label").removeClass("disabled");
        $(".img-content").attr("src", emptyImg);
        }
    })

    // Проверка на загруженный контент при отправке формы
    $("#add-content").find(".btn-primary").click(function(){
        if($("#add-file").val() == "") {
            $(this).before("<span class='invalid-feedback d-block' id='add-content-error' role='alert'>Добавьте файл</span>")
        }
    })
})
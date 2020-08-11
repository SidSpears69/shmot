$(document).ready(function () {
    // Daterangepicker.js
    $('#reservation').daterangepicker({
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
    var table = $("#orders").DataTable({
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "orders.php",
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
                    return "<a href=" + data + ">@" + outputUser(data) + "</a>";
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
                    return "<div class='progress'><div class='progress-bar bg-primary progress-bar-striped' role='progressbar' aria-valuenow=" + data.current + " aria-valuemin='" + data.min + "' aria-valuemax='" + data.max + "' style='width:" + data.current + "%'></div></div>";
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
                    return "<a href='" + data.link_edit + "' class='btn btn-primary mr-1'><i class='fas fa-edit'></i><span class='sr-only'>Редактировать</span></a><a href='" + data.link_view + "' class='btn btn-primary ml-1'><i class='fas fa-search-plus'></i><span class='sr-only'>Посмотреть</span></a>"
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
    $('#orders tbody').on('click', 'tr td.details-control', function () {
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

    // Получение имени пользователя
    function outputUser(link) {
        return link.split('/')[3];
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


    // Поиск по Datatables
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
        var value = {
            "social_type": $("#social-list").val(),
            "social": $(this).val()
        }
        table.columns($(".user-link")).search(value).draw();
    })
    $("#social-list").change(function () {
        if ($("#search-username").val()) {
            var value = {
                "social_type": $(this).val(),
                "social": $("#search-username").val()
            }
            table.columns($(".user-link")).search(value).draw();
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
})
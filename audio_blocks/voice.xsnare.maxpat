{
  "patcher": {
    "fileversion": 1,
    "appversion": {
      "major": 9,
      "minor": 1,
      "revision": 2,
      "architecture": "x64",
      "modernui": 1
    },
    "classnamespace": "box",
    "rect": [
      170.0,
      193.0,
      1320.0,
      760.0
    ],
    "boxes": [
      {
        "box": {
          "id": "obj-1",
          "maxclass": "newobj",
          "patching_rect": [
            40.0,
            30.0,
            28.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "in 1",
          "saved_object_attributes": {
            "attr_comment": "",
            "c": ""
          }
        }
      },
      {
        "box": {
          "id": "obj-2",
          "maxclass": "newobj",
          "patching_rect": [
            80.0,
            30.0,
            124.0,
            22.0
          ],
          "numinlets": 4,
          "numoutlets": 11,
          "outlettype": [
            "",
            "bang",
            "",
            "",
            "",
            "",
            "",
            "",
            "int",
            "",
            ""
          ],
          "text": "voiceheader"
        }
      },
      {
        "box": {
          "id": "obj-3",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            30.0,
            470.0,
            22.0
          ],
          "numinlets": 19,
          "numoutlets": 19,
          "outlettype": [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
          ],
          "text": "route 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17"
        }
      },
      {
        "box": {
          "id": "obj-4",
          "maxclass": "newobj",
          "patching_rect": [
            80.0,
            70.0,
            71.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "int",
            "float"
          ],
          "text": "unpack 0 0."
        }
      },
      {
        "box": {
          "id": "obj-5",
          "maxclass": "newobj",
          "patching_rect": [
            80.0,
            108.0,
            57.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "pack 0 0."
        }
      },
      {
        "box": {
          "id": "obj-6",
          "maxclass": "newobj",
          "patching_rect": [
            80.0,
            145.0,
            63.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "prepend 0"
        }
      },
      {
        "box": {
          "id": "obj-7",
          "maxclass": "newobj",
          "patching_rect": [
            80.0,
            182.0,
            35.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "text": "out 1",
          "saved_object_attributes": {
            "attr_comment": "",
            "c": ""
          }
        }
      },
      {
        "box": {
          "id": "obj-8",
          "maxclass": "newobj",
          "patching_rect": [
            40.0,
            300.0,
            56.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "int",
            "int",
            "int"
          ],
          "text": "thispoly~"
        }
      },
      {
        "box": {
          "id": "obj-9",
          "maxclass": "message",
          "patching_rect": [
            40.0,
            270.0,
            45.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "mute 0"
        }
      },
      {
        "box": {
          "id": "obj-10",
          "maxclass": "newobj",
          "patching_rect": [
            120.0,
            300.0,
            50.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "int",
            "int"
          ],
          "text": "change"
        }
      },
      {
        "box": {
          "id": "obj-11",
          "maxclass": "newobj",
          "patching_rect": [
            220.0,
            300.0,
            65.0,
            22.0
          ],
          "numinlets": 4,
          "numoutlets": 1,
          "outlettype": [
            "int"
          ],
          "text": "mutecontrol"
        }
      },
      {
        "box": {
          "id": "obj-12",
          "maxclass": "newobj",
          "patching_rect": [
            220.0,
            70.0,
            39.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "int"
          ],
          "text": "active"
        }
      },
      {
        "box": {
          "id": "obj-13",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            300.0,
            42.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "text": "out~ 1"
        }
      },
      {
        "box": {
          "id": "obj-14",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            230.0,
            73.0,
            22.0
          ],
          "numinlets": 9,
          "numoutlets": 1,
          "outlettype": [
            "signal"
          ],
          "text": "xox.snare~"
        }
      },
      {
        "box": {
          "id": "obj-15",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            265.0,
            30.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "signal"
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "obj-16",
          "maxclass": "newobj",
          "patching_rect": [
            360.0,
            265.0,
            36.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "signal"
          ],
          "text": "line~"
        }
      },
      {
        "box": {
          "id": "obj-17",
          "maxclass": "newobj",
          "patching_rect": [
            160.0,
            70.0,
            41.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "float"
          ],
          "text": "abs 0."
        }
      },
      {
        "box": {
          "id": "obj-18",
          "maxclass": "newobj",
          "patching_rect": [
            160.0,
            130.0,
            33.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "int"
          ],
          "text": "> 0."
        }
      },
      {
        "box": {
          "id": "obj-19",
          "maxclass": "newobj",
          "patching_rect": [
            160.0,
            160.0,
            37.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 2,
          "outlettype": [
            "bang",
            ""
          ],
          "text": "sel 1"
        }
      },
      {
        "box": {
          "id": "obj-20",
          "maxclass": "newobj",
          "patching_rect": [
            220.0,
            130.0,
            43.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "float"
          ],
          "text": "/ 128."
        }
      },
      {
        "box": {
          "id": "obj-21",
          "maxclass": "newobj",
          "patching_rect": [
            220.0,
            160.0,
            29.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "float"
          ],
          "text": "f"
        }
      },
      {
        "box": {
          "id": "obj-22",
          "maxclass": "newobj",
          "patching_rect": [
            160.0,
            190.0,
            63.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 4,
          "outlettype": [
            "bang",
            "bang",
            "bang",
            "bang"
          ],
          "text": "t b b b b"
        }
      },
      {
        "box": {
          "id": "obj-23",
          "maxclass": "message",
          "patching_rect": [
            300.0,
            190.0,
            44.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "trigger"
        }
      },
      {
        "box": {
          "id": "obj-24",
          "maxclass": "newobj",
          "patching_rect": [
            40.0,
            240.0,
            58.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "bang"
          ],
          "text": "loadbang"
        }
      },
      {
        "box": {
          "id": "obj-25",
          "maxclass": "newobj",
          "patching_rect": [
            500.0,
            70.0,
            79.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "loadmess 0.5"
        }
      },
      {
        "box": {
          "id": "obj-26",
          "maxclass": "newobj",
          "patching_rect": [
            500.0,
            100.0,
            79.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 0,
          "text": "s #0_velnorm"
        }
      },
      {
        "box": {
          "id": "obj-27",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            70.0,
            79.0,
            22.0
          ],
          "numinlets": 0,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "r #0_velnorm"
        }
      },
      {
        "box": {
          "id": "obj-42",
          "maxclass": "newobj",
          "patching_rect": [
            160.0,
            100.0,
            35.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "float",
            "float"
          ],
          "text": "t f f"
        }
      },
      {
        "box": {
          "id": "obj-29",
          "maxclass": "newobj",
          "patching_rect": [
            700.0,
            340.0,
            360.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "expr max(0.\\, min(1.\\, 1. - max(0.\\, $f2) * (1. - $f1) + min(0.\\, $f2) * $f1))"
        }
      },
      {
        "box": {
          "id": "obj-30",
          "maxclass": "newobj",
          "patching_rect": [
            700.0,
            370.0,
            29.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "float"
          ],
          "text": "f"
        }
      },
      {
        "box": {
          "id": "obj-31",
          "maxclass": "newobj",
          "patching_rect": [
            700.0,
            400.0,
            57.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "pack 0. 1."
        }
      },
      {
        "box": {
          "id": "obj-32",
          "maxclass": "newobj",
          "patching_rect": [
            430.0,
            265.0,
            85.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "loadmess 1. 0."
        }
      },
      {
        "box": {
          "id": "obj-34",
          "maxclass": "newobj",
          "patching_rect": [
            700.0,
            440.0,
            228.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "expr max(-1.\\, min(1.\\, (($f1 * 2.) - 1.) * $f2))"
        }
      },
      {
        "box": {
          "id": "obj-35",
          "maxclass": "newobj",
          "patching_rect": [
            960.0,
            230.0,
            29.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "float"
          ],
          "text": "f"
        }
      },
      {
        "box": {
          "id": "obj-36",
          "maxclass": "newobj",
          "patching_rect": [
            960.0,
            260.0,
            57.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "pack 0. 0."
        }
      },
      {
        "box": {
          "id": "obj-37",
          "maxclass": "newobj",
          "patching_rect": [
            960.0,
            290.0,
            170.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + $f2))"
        }
      },
      {
        "box": {
          "id": "obj-38",
          "maxclass": "message",
          "patching_rect": [
            960.0,
            320.0,
            70.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "param 8 $1"
        }
      },
      {
        "box": {
          "id": "obj-39",
          "maxclass": "message",
          "patching_rect": [
            760.0,
            230.0,
            70.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "param 8 $1"
        }
      },
      {
        "box": {
          "id": "obj-40",
          "maxclass": "newobj",
          "patching_rect": [
            760.0,
            190.0,
            29.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "int"
          ],
          "text": "i"
        }
      },
      {
        "box": {
          "id": "obj-41",
          "maxclass": "message",
          "patching_rect": [
            760.0,
            160.0,
            58.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "pos 7 $1"
        }
      },
      {
        "box": {
          "id": "obj-50",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            120.0,
            68.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "pak 0. 0. 0."
        }
      },
      {
        "box": {
          "id": "obj-51",
          "maxclass": "newobj",
          "patching_rect": [
            380.0,
            120.0,
            260.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + (($f2 * 2.) - 1.) * $f3))"
        }
      },
      {
        "box": {
          "id": "obj-52",
          "maxclass": "message",
          "patching_rect": [
            650.0,
            120.0,
            70.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "param 0 $1"
        }
      },
      {
        "box": {
          "id": "obj-53",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            155.0,
            68.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "pak 0. 0. 0."
        }
      },
      {
        "box": {
          "id": "obj-54",
          "maxclass": "newobj",
          "patching_rect": [
            380.0,
            155.0,
            260.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + (($f2 * 2.) - 1.) * $f3))"
        }
      },
      {
        "box": {
          "id": "obj-55",
          "maxclass": "message",
          "patching_rect": [
            650.0,
            155.0,
            70.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "param 1 $1"
        }
      },
      {
        "box": {
          "id": "obj-56",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            190.0,
            68.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "pak 0. 0. 0."
        }
      },
      {
        "box": {
          "id": "obj-57",
          "maxclass": "newobj",
          "patching_rect": [
            380.0,
            190.0,
            260.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + (($f2 * 2.) - 1.) * $f3))"
        }
      },
      {
        "box": {
          "id": "obj-58",
          "maxclass": "message",
          "patching_rect": [
            650.0,
            190.0,
            70.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "param 2 $1"
        }
      },
      {
        "box": {
          "id": "obj-59",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            225.0,
            68.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "pak 0. 0. 0."
        }
      },
      {
        "box": {
          "id": "obj-60",
          "maxclass": "newobj",
          "patching_rect": [
            380.0,
            225.0,
            260.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + (($f2 * 2.) - 1.) * $f3))"
        }
      },
      {
        "box": {
          "id": "obj-61",
          "maxclass": "message",
          "patching_rect": [
            650.0,
            225.0,
            70.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "param 3 $1"
        }
      },
      {
        "box": {
          "id": "obj-62",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            260.0,
            68.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "pak 0. 0. 0."
        }
      },
      {
        "box": {
          "id": "obj-63",
          "maxclass": "newobj",
          "patching_rect": [
            380.0,
            260.0,
            260.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + (($f2 * 2.) - 1.) * $f3))"
        }
      },
      {
        "box": {
          "id": "obj-64",
          "maxclass": "message",
          "patching_rect": [
            650.0,
            260.0,
            70.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "param 4 $1"
        }
      },
      {
        "box": {
          "id": "obj-65",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            295.0,
            68.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "pak 0. 0. 0."
        }
      },
      {
        "box": {
          "id": "obj-66",
          "maxclass": "newobj",
          "patching_rect": [
            380.0,
            295.0,
            260.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + (($f2 * 2.) - 1.) * $f3))"
        }
      },
      {
        "box": {
          "id": "obj-67",
          "maxclass": "message",
          "patching_rect": [
            650.0,
            295.0,
            70.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "param 5 $1"
        }
      },
      {
        "box": {
          "id": "obj-68",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            330.0,
            68.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "pak 0. 0. 0."
        }
      },
      {
        "box": {
          "id": "obj-69",
          "maxclass": "newobj",
          "patching_rect": [
            380.0,
            330.0,
            260.0,
            22.0
          ],
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + (($f2 * 2.) - 1.) * $f3))"
        }
      },
      {
        "box": {
          "id": "obj-70",
          "maxclass": "message",
          "patching_rect": [
            650.0,
            330.0,
            70.0,
            22.0
          ],
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "text": "param 6 $1"
        }
      },
      {
        "box": {
          "id": "obj-71",
          "maxclass": "newobj",
          "patching_rect": [
            40.0,
            420.0,
            39.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "signal"
          ],
          "text": "in~ 1",
          "saved_object_attributes": {
            "attr_comment": "",
            "c": ""
          }
        }
      },
      {
        "box": {
          "id": "obj-72",
          "maxclass": "newobj",
          "patching_rect": [
            100.0,
            420.0,
            39.0,
            22.0
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "signal"
          ],
          "text": "in~ 2",
          "saved_object_attributes": {
            "attr_comment": "",
            "c": ""
          }
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "obj-1",
            0
          ],
          "destination": [
            "obj-2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-12",
            0
          ],
          "destination": [
            "obj-2",
            3
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-2",
            3
          ],
          "destination": [
            "obj-3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-2",
            2
          ],
          "destination": [
            "obj-4",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-2",
            0
          ],
          "destination": [
            "obj-7",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-4",
            0
          ],
          "destination": [
            "obj-5",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-4",
            1
          ],
          "destination": [
            "obj-5",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-5",
            0
          ],
          "destination": [
            "obj-6",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-6",
            0
          ],
          "destination": [
            "obj-7",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-4",
            1
          ],
          "destination": [
            "obj-17",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-17",
            0
          ],
          "destination": [
            "obj-42",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-42",
            1
          ],
          "destination": [
            "obj-20",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-42",
            0
          ],
          "destination": [
            "obj-18",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-18",
            0
          ],
          "destination": [
            "obj-19",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-19",
            0
          ],
          "destination": [
            "obj-22",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-20",
            0
          ],
          "destination": [
            "obj-21",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-22",
            3
          ],
          "destination": [
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-22",
            2
          ],
          "destination": [
            "obj-21",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-22",
            1
          ],
          "destination": [
            "obj-35",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-22",
            1
          ],
          "destination": [
            "obj-30",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-22",
            0
          ],
          "destination": [
            "obj-23",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-22",
            0
          ],
          "destination": [
            "obj-11",
            3
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-23",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-21",
            0
          ],
          "destination": [
            "obj-26",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-21",
            0
          ],
          "destination": [
            "obj-11",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-25",
            0
          ],
          "destination": [
            "obj-26",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-24",
            0
          ],
          "destination": [
            "obj-9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-9",
            0
          ],
          "destination": [
            "obj-8",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-8",
            1
          ],
          "destination": [
            "obj-10",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-10",
            0
          ],
          "destination": [
            "obj-11",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-11",
            0
          ],
          "destination": [
            "obj-8",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-14",
            0
          ],
          "destination": [
            "obj-15",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-16",
            0
          ],
          "destination": [
            "obj-15",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-15",
            0
          ],
          "destination": [
            "obj-11",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-15",
            0
          ],
          "destination": [
            "obj-13",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-32",
            0
          ],
          "destination": [
            "obj-16",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-27",
            0
          ],
          "destination": [
            "obj-29",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            17
          ],
          "destination": [
            "obj-29",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-29",
            0
          ],
          "destination": [
            "obj-30",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-30",
            0
          ],
          "destination": [
            "obj-31",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-31",
            0
          ],
          "destination": [
            "obj-16",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            8
          ],
          "destination": [
            "obj-39",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-39",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            8
          ],
          "destination": [
            "obj-35",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-27",
            0
          ],
          "destination": [
            "obj-34",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            16
          ],
          "destination": [
            "obj-34",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-34",
            0
          ],
          "destination": [
            "obj-36",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-35",
            0
          ],
          "destination": [
            "obj-36",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-36",
            0
          ],
          "destination": [
            "obj-37",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-37",
            0
          ],
          "destination": [
            "obj-38",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-38",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            7
          ],
          "destination": [
            "obj-40",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-40",
            0
          ],
          "destination": [
            "obj-41",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-41",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            0
          ],
          "destination": [
            "obj-50",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-27",
            0
          ],
          "destination": [
            "obj-50",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            9
          ],
          "destination": [
            "obj-50",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-50",
            0
          ],
          "destination": [
            "obj-51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-51",
            0
          ],
          "destination": [
            "obj-52",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-52",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            1
          ],
          "destination": [
            "obj-53",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-27",
            0
          ],
          "destination": [
            "obj-53",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            10
          ],
          "destination": [
            "obj-53",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-53",
            0
          ],
          "destination": [
            "obj-54",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-54",
            0
          ],
          "destination": [
            "obj-55",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-55",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            2
          ],
          "destination": [
            "obj-56",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-27",
            0
          ],
          "destination": [
            "obj-56",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            11
          ],
          "destination": [
            "obj-56",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-56",
            0
          ],
          "destination": [
            "obj-57",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-57",
            0
          ],
          "destination": [
            "obj-58",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-58",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            3
          ],
          "destination": [
            "obj-59",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-27",
            0
          ],
          "destination": [
            "obj-59",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            12
          ],
          "destination": [
            "obj-59",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-59",
            0
          ],
          "destination": [
            "obj-60",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-60",
            0
          ],
          "destination": [
            "obj-61",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-61",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            4
          ],
          "destination": [
            "obj-62",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-27",
            0
          ],
          "destination": [
            "obj-62",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            13
          ],
          "destination": [
            "obj-62",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-62",
            0
          ],
          "destination": [
            "obj-63",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-63",
            0
          ],
          "destination": [
            "obj-64",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-64",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            5
          ],
          "destination": [
            "obj-65",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-27",
            0
          ],
          "destination": [
            "obj-65",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            14
          ],
          "destination": [
            "obj-65",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-65",
            0
          ],
          "destination": [
            "obj-66",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-66",
            0
          ],
          "destination": [
            "obj-67",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-67",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            6
          ],
          "destination": [
            "obj-68",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-27",
            0
          ],
          "destination": [
            "obj-68",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-3",
            15
          ],
          "destination": [
            "obj-68",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-68",
            0
          ],
          "destination": [
            "obj-69",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-69",
            0
          ],
          "destination": [
            "obj-70",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-70",
            0
          ],
          "destination": [
            "obj-14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-71",
            0
          ],
          "destination": [
            "obj-14",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-72",
            0
          ],
          "destination": [
            "obj-14",
            8
          ]
        }
      }
    ]
  }
}
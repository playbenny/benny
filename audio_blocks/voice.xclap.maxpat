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
          "text": "in 1",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
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
          "text": "voiceheader",
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
          ]
        }
      },
      {
        "box": {
          "id": "obj-3",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            30.0,
            302.0,
            22.0
          ],
          "text": "route 0 1 2 3 4 5 6 7 8 9 10 11 12",
          "numinlets": 14,
          "numoutlets": 14,
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
            ""
          ]
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
          "text": "unpack 0 0.",
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "int",
            "float"
          ]
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
          "text": "pack 0 0.",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
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
          "text": "prepend 0",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
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
          "text": "out 1",
          "numinlets": 1,
          "numoutlets": 0,
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
          "text": "thispoly~",
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "int",
            "int",
            "int"
          ]
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
          "text": "mute 0",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
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
          "text": "change",
          "numinlets": 1,
          "numoutlets": 3,
          "outlettype": [
            "",
            "int",
            "int"
          ]
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
          "text": "mutecontrol",
          "numinlets": 4,
          "numoutlets": 1,
          "outlettype": [
            "int"
          ]
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
          "text": "active",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "int"
          ]
        }
      },
      {
        "box": {
          "id": "obj-14",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            230.0,
            65.0,
            22.0
          ],
          "text": "xox.clap~",
          "numinlets": 7,
          "numoutlets": 1,
          "outlettype": [
            "signal"
          ]
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
          "text": "*~",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "signal"
          ]
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
          "text": "line~",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "signal"
          ]
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
          "text": "out~ 1",
          "numinlets": 1,
          "numoutlets": 0
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
          "text": "abs 0.",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "float"
          ]
        }
      },
      {
        "box": {
          "id": "obj-18",
          "maxclass": "newobj",
          "patching_rect": [
            160.0,
            100.0,
            35.0,
            22.0
          ],
          "text": "t f f",
          "numinlets": 1,
          "numoutlets": 2,
          "outlettype": [
            "float",
            "float"
          ]
        }
      },
      {
        "box": {
          "id": "obj-19",
          "maxclass": "newobj",
          "patching_rect": [
            160.0,
            130.0,
            33.0,
            22.0
          ],
          "text": "> 0.",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "int"
          ]
        }
      },
      {
        "box": {
          "id": "obj-20",
          "maxclass": "newobj",
          "patching_rect": [
            160.0,
            160.0,
            37.0,
            22.0
          ],
          "text": "sel 1",
          "numinlets": 2,
          "numoutlets": 2,
          "outlettype": [
            "bang",
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-21",
          "maxclass": "newobj",
          "patching_rect": [
            220.0,
            130.0,
            43.0,
            22.0
          ],
          "text": "/ 128.",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "float"
          ]
        }
      },
      {
        "box": {
          "id": "obj-22",
          "maxclass": "newobj",
          "patching_rect": [
            220.0,
            160.0,
            29.0,
            22.0
          ],
          "text": "f",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "float"
          ]
        }
      },
      {
        "box": {
          "id": "obj-23",
          "maxclass": "newobj",
          "patching_rect": [
            160.0,
            190.0,
            63.0,
            22.0
          ],
          "text": "t b b b b",
          "numinlets": 1,
          "numoutlets": 4,
          "outlettype": [
            "bang",
            "bang",
            "bang",
            "bang"
          ]
        }
      },
      {
        "box": {
          "id": "obj-24",
          "maxclass": "message",
          "patching_rect": [
            300.0,
            190.0,
            44.0,
            22.0
          ],
          "text": "trigger",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-25",
          "maxclass": "newobj",
          "patching_rect": [
            220.0,
            190.0,
            79.0,
            22.0
          ],
          "text": "s #0_velnorm",
          "numinlets": 1,
          "numoutlets": 0
        }
      },
      {
        "box": {
          "id": "obj-26",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            70.0,
            79.0,
            22.0
          ],
          "text": "loadmess 0.5",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-27",
          "maxclass": "newobj",
          "patching_rect": [
            40.0,
            240.0,
            58.0,
            22.0
          ],
          "text": "loadbang",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "bang"
          ]
        }
      },
      {
        "box": {
          "id": "obj-28",
          "maxclass": "newobj",
          "patching_rect": [
            620.0,
            260.0,
            79.0,
            22.0
          ],
          "text": "r #0_velnorm",
          "numinlets": 0,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-29",
          "maxclass": "newobj",
          "patching_rect": [
            620.0,
            290.0,
            360.0,
            22.0
          ],
          "text": "expr max(0.\\, min(1.\\, 1. - max(0.\\, $f2) * (1. - $f1) + min(0.\\, $f2) * $f1))",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-30",
          "maxclass": "newobj",
          "patching_rect": [
            620.0,
            320.0,
            29.0,
            22.0
          ],
          "text": "f",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            "float"
          ]
        }
      },
      {
        "box": {
          "id": "obj-31",
          "maxclass": "newobj",
          "patching_rect": [
            620.0,
            350.0,
            57.0,
            22.0
          ],
          "text": "pack 0. 1.",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
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
          "text": "loadmess 1. 0.",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-50",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            110.0,
            68.0,
            22.0
          ],
          "text": "pak 0. 0. 0.",
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-51",
          "maxclass": "newobj",
          "patching_rect": [
            380.0,
            110.0,
            260.0,
            22.0
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + (($f2 * 2.) - 1.) * $f3))",
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-52",
          "maxclass": "message",
          "patching_rect": [
            650.0,
            110.0,
            70.0,
            22.0
          ],
          "text": "param 0 $1",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-53",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            140.0,
            68.0,
            22.0
          ],
          "text": "pak 0. 0. 0.",
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-54",
          "maxclass": "newobj",
          "patching_rect": [
            380.0,
            140.0,
            260.0,
            22.0
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + (($f2 * 2.) - 1.) * $f3))",
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-55",
          "maxclass": "message",
          "patching_rect": [
            650.0,
            140.0,
            70.0,
            22.0
          ],
          "text": "param 1 $1",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-56",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            170.0,
            68.0,
            22.0
          ],
          "text": "pak 0. 0. 0.",
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-57",
          "maxclass": "newobj",
          "patching_rect": [
            380.0,
            170.0,
            260.0,
            22.0
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + (($f2 * 2.) - 1.) * $f3))",
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-58",
          "maxclass": "message",
          "patching_rect": [
            650.0,
            170.0,
            70.0,
            22.0
          ],
          "text": "param 2 $1",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-59",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            200.0,
            68.0,
            22.0
          ],
          "text": "pak 0. 0. 0.",
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-60",
          "maxclass": "newobj",
          "patching_rect": [
            380.0,
            200.0,
            260.0,
            22.0
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + (($f2 * 2.) - 1.) * $f3))",
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-61",
          "maxclass": "message",
          "patching_rect": [
            650.0,
            200.0,
            70.0,
            22.0
          ],
          "text": "param 3 $1",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-62",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            230.0,
            68.0,
            22.0
          ],
          "text": "pak 0. 0. 0.",
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-63",
          "maxclass": "newobj",
          "patching_rect": [
            380.0,
            230.0,
            260.0,
            22.0
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + (($f2 * 2.) - 1.) * $f3))",
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-64",
          "maxclass": "message",
          "patching_rect": [
            650.0,
            230.0,
            70.0,
            22.0
          ],
          "text": "param 4 $1",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-65",
          "maxclass": "newobj",
          "patching_rect": [
            300.0,
            260.0,
            68.0,
            22.0
          ],
          "text": "pak 0. 0. 0.",
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-66",
          "maxclass": "newobj",
          "patching_rect": [
            380.0,
            260.0,
            260.0,
            22.0
          ],
          "text": "expr max(0.\\, min(1.\\, $f1 + (($f2 * 2.) - 1.) * $f3))",
          "numinlets": 3,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-67",
          "maxclass": "message",
          "patching_rect": [
            650.0,
            260.0,
            70.0,
            22.0
          ],
          "text": "param 5 $1",
          "numinlets": 2,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-80",
          "maxclass": "newobj",
          "patching_rect": [
            240.0,
            110.0,
            79.0,
            22.0
          ],
          "text": "r #0_velnorm",
          "numinlets": 0,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-81",
          "maxclass": "newobj",
          "patching_rect": [
            240.0,
            140.0,
            79.0,
            22.0
          ],
          "text": "r #0_velnorm",
          "numinlets": 0,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-82",
          "maxclass": "newobj",
          "patching_rect": [
            240.0,
            170.0,
            79.0,
            22.0
          ],
          "text": "r #0_velnorm",
          "numinlets": 0,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-83",
          "maxclass": "newobj",
          "patching_rect": [
            240.0,
            200.0,
            79.0,
            22.0
          ],
          "text": "r #0_velnorm",
          "numinlets": 0,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-84",
          "maxclass": "newobj",
          "patching_rect": [
            240.0,
            230.0,
            79.0,
            22.0
          ],
          "text": "r #0_velnorm",
          "numinlets": 0,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-85",
          "maxclass": "newobj",
          "patching_rect": [
            240.0,
            260.0,
            79.0,
            22.0
          ],
          "text": "r #0_velnorm",
          "numinlets": 0,
          "numoutlets": 1,
          "outlettype": [
            ""
          ]
        }
      },
      {
        "box": {
          "id": "obj-90",
          "maxclass": "newobj",
          "patching_rect": [
            40.0,
            420.0,
            39.0,
            22.0
          ],
          "text": "in~ 1",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "signal"
          ],
          "saved_object_attributes": {
            "attr_comment": "",
            "c": ""
          }
        }
      },
      {
        "box": {
          "id": "obj-91",
          "maxclass": "newobj",
          "patching_rect": [
            100.0,
            420.0,
            39.0,
            22.0
          ],
          "text": "in~ 2",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            "signal"
          ],
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
            "obj-18",
            1
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
            "obj-19",
            0
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
            "obj-20",
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
            "obj-21",
            0
          ],
          "destination": [
            "obj-22",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-23",
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
            "obj-23",
            2
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
            "obj-23",
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
            "obj-23",
            0
          ],
          "destination": [
            "obj-24",
            0
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
            "obj-11",
            3
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
            "obj-14",
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
            "obj-25",
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
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-26",
            0
          ],
          "destination": [
            "obj-25",
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
            "obj-28",
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
            12
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
            "obj-80",
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
            6
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
            "obj-81",
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
            7
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
            "obj-82",
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
            8
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
            "obj-83",
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
            9
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
            "obj-84",
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
            10
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
            "obj-85",
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
            11
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
            "obj-90",
            0
          ],
          "destination": [
            "obj-14",
            3
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "obj-91",
            0
          ],
          "destination": [
            "obj-14",
            6
          ]
        }
      }
    ]
  }
}
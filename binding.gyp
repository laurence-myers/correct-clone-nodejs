{
  "targets": [
    {
      "target_name": "CorrectClone",
      "sources": [
        "src/correctclone.cc"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      'conditions': [
        ['OS=="mac"', {
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
            'CLANG_CXX_LIBRARY': 'libc++',
            'CLANG_CXX_LANGUAGE_STANDARD':'c++11'
          }
        }]
      ]
    }
  ]
}

import fs from 'fs'

export default {
    delete_file: (file) => {
        fs.unlink(`.${file}`, (err) => {
            if (err) console.log(err)
        })
    },
    delete_folder: (folder) => {
        fs.rm(`.${folder}`, {
            recursive: true
        }, (err) => {
            if (err) console.log(err)
        })
    }
}
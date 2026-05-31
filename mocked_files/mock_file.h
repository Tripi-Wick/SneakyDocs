#pragma once

#include <string>
#include <vector>

/**
 * @file testfile.h
 * @brief Header file containing the declarations for the FileSystem module.
 * * This file defines the core classes and structures needed to interact
 * with the underlying operating system's file structures safely and
 * efficiently.
 */

namespace CoreOS {

    /**
     * @struct FileMetadata
     * @brief Contains statistical data about a file.
     * * Holds information such as creation time, modification time,
     * file size, and access permissions.
     */
    struct FileMetadata {
        long long byteSize;       /**< The total size of the file in bytes. */
        bool isReadOnly;          /**< Flag indicating if the file is locked. */
        std::string ownerName;    /**< The username of the file owner. */
    };

    /**
     * @class DirectoryScanner
     * @brief Utility class for indexing directory contents.
     * * The DirectoryScanner traverses local file system trees,
     * collecting metadata and building an internal cache of
     * paths for fast searching.
     */
    class DirectoryScanner {
    private:
        std::string rootPath;

    public:
        /**
         * @brief Constructs a new Directory Scanner object.
         * * @param path The absolute path to the root directory to scan.
         */
        DirectoryScanner(const std::string& path);

        /**
         * @brief Performs a deep scan of the directory tree.
         * * Recursively iterates through all subdirectories and populates
         * the internal file list. Symbolic links are ignored to prevent
         * infinite loops.
         * * @param recursive If true, subdirectories are also scanned.
         * @return int The total number of files discovered.
         */
        int executeScan(bool recursive);

        /**
         * @brief Retrieves metadata for a specific file.
         * * @param filename The name of the file within the scanned directory.
         * @return FileMetadata A struct containing the file's properties.
         */
        FileMetadata getMetadata(const std::string& filename);
    };

} // namespace CoreOS
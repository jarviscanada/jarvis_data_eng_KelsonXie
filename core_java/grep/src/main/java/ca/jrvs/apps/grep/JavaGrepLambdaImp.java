package ca.jrvs.apps.grep;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class JavaGrepLambdaImp extends JavaGrepImp {

    @Override
    public void process() throws IOException {
        if (getRegex() == null || getRootPath() == null || getOutFile() == null) {
            throw new IllegalStateException("USAGE: JavaGrep <regex> <rootPath> <outFile>");
        }

        // Stream-only pipeline:
        // 1) list files
        // 2) turn each file into a stream of its lines
        // 3) filter lines by regex
        // 4) collect to a list
        // 5) write out
        List<String> matchedLines = listFiles(getRootPath()).stream()
                .flatMap(this::fileLinesAsStream)   // File -> Stream<String>
                .filter(this::containsPattern)      // keep only matched lines
                .collect(Collectors.toList());

        writeToFile(matchedLines);
    }

    /**
     * Helper to adapt your existing readLines(File) (which returns List<String>)
     * into a Stream<String> for flatMap.
     */
    private Stream<String> fileLinesAsStream(File file) {
        return readLines(file).stream();
    }

    public static void main(String[] args) {
        if (args.length != 3) {
            throw new IllegalArgumentException("USAGE: JavaGrep <regex> <rootPath> <outFile>");
        }

        JavaGrepLambdaImp app = new JavaGrepLambdaImp();
        app.setRegex(args[0]);
        app.setRootPath(args[1]);
        app.setOutFile(args[2]);

        try {
            app.process();
        } catch (Exception ex) {
            throw new RuntimeException("Process failed to run", ex);
        }
    }
}

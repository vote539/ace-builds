define('ace/mode/octave', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text', 'ace/tokenizer', 'ace/mode/matching_brace_outdent', 'ace/range', 'ace/mode/octave_highlight_rules'], function(require, exports, module) {


var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var Range = require("../range").Range;
var OctaveHighlightRules = require("./octave_highlight_rules").OctaveHighlightRules;

var Mode = function() {
	var highlighter = new OctaveHighlightRules();
	this.$outdent = new MatchingBraceOutdent();

	this.$tokenizer = new Tokenizer(highlighter.getRules());
};
oop.inherits(Mode, TextMode);

(function() {
	var keywordsYieldingIndent = "if|elseif|else|while|for|do";
	var keywordsYieldingOutdent = "end|else";
	var outdentRegExp = new RegExp("^\\s+(?:"+keywordsYieldingOutdent+")$");

	this.getNextLineIndent = function(state, line, tab) {
		var indent = this.$getIndent(line);

		var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
		var tokens = tokenizedLine.tokens;

		if (tokens.length && tokens[tokens.length-1].type == "comment") {
			return indent;
		}
		
		if (state == "start") {
			var match = line.match("(?:;|^)\\s*(?:"+keywordsYieldingIndent+")[^;]*$");
			var fnMatch = line.match(/^\s*function.+?\=\s*(\w+)\(.*\)\s*$/);
			if (match) {
				indent += tab;
			}else if(fnMatch){
				indent += "% "+fnMatch[1]+": ";
			}
		}

		return indent;
	};

	this.checkOutdent = function(state, line, input) {
		return outdentRegExp.test(line+input);
	};

	this.autoOutdent = function(state, doc, row) {
		var indent = this.$getIndent(doc.getLine(row));
		var tab = doc.getTabString();
		if (indent.slice(-tab.length) == tab)
			doc.remove(new Range(row, indent.length-tab.length, row, indent.length));
	};
}).call(Mode.prototype);

exports.Mode = Mode;
});

define('ace/mode/matching_brace_outdent', ['require', 'exports', 'module' , 'ace/range'], function(require, exports, module) {


var Range = require("../range").Range;

var MatchingBraceOutdent = function() {};

(function() {

    this.checkOutdent = function(line, input) {
        if (! /^\s+$/.test(line))
            return false;

        return /^\s*\}/.test(input);
    };

    this.autoOutdent = function(doc, row) {
        var line = doc.getLine(row);
        var match = line.match(/^(\s*\})/);

        if (!match) return 0;

        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket({row: row, column: column});

        if (!openBracePos || openBracePos.row == row) return 0;

        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column-1), indent);
    };

    this.$getIndent = function(line) {
        return line.match(/^\s*/)[0];
    };

}).call(MatchingBraceOutdent.prototype);

exports.MatchingBraceOutdent = MatchingBraceOutdent;
});
define('ace/mode/octave_highlight_rules', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function(require, exports, module) {


var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var OctaveHighlightRules = function() {
	var builtinConstants = "argv|e|eps|F_DUPFD|F_GETFD|F_GETFL|filesep|F_SETFD|F_SETFL|inf|Inf|NA|nan|NaN|O_APPEND|O_ASYNC|O_CREAT|OCTAVE_HOME|OCTAVE_VERSION|O_EXCL|O_NONBLOCK|O_RDONLY|O_RDWR|O_SYNC|O_TRUNC|O_WRONLY|pi|program_invocation_name|program_name|P_tmpdir|realmax|realmin|SEEK_CUR|SEEK_END|SEEK_SET|SIG|stderr|stdin|stdout|ans|automatic_replot|beep_on_error|completion_append_char|crash_dumps_octave_core|current_script_file_name|debug_on_error|debug_on_interrupt|debug_on_warning|debug_symtab_lookups|DEFAULT_EXEC_PATH|DEFAULT_LOADPATH|default_save_format|echo_executing_commands|EDITOR|EXEC_PATH|FFTW_WISDOM_PROGRAM|fixed_point_format|gnuplot_binary|gnuplot_command_axes|gnuplot_command_end|gnuplot_command_plot|gnuplot_command_replot|gnuplot_command_splot|gnuplot_command_title|gnuplot_command_using|gnuplot_command_with|gnuplot_has_frames|history_file|history_size|ignore_function_time_stamp|IMAGEPATH|INFO_FILE|INFO_PROGRAM|__kluge_procbuf_delay__|LOADPATH|MAKEINFO_PROGRAM|max_recursion_depth|octave_core_file_format|octave_core_file_limit|octave_core_file_name|output_max_field_width|output_precision|page_output_immediately|PAGER|page_screen_output|print_answer_id_name|print_empty_dimensions|print_rhs_assign_val|PS1|PS2|PS4|save_header_format_string|save_precision|saving_history|sighup_dumps_octave_core|sigterm_dumps_octave_core|silent_functions|split_long_rows|string_fill_char|struct_levels_to_print|suppress_verbose_help_message|variables_can_hide_functions|warn_assign_as_truth_value|warn_divide_by_zero|warn_empty_list_elements|warn_fortran_indexing|warn_function_name_clash|warn_future_time_stamp|warn_imag_to_real|warn_matlab_incompatible|warn_missing_semicolon|warn_neg_dim_as_zero|warn_num_to_str|warn_precedence_change|warn_reload_forces_clear|warn_resize_on_range_error|warn_separator_insert|warn_single_quote_string|warn_str_to_num|warn_undefined_return_values|warn_variable_switch_label|whos_line_format";
	var keywords = "all_va_args|break|case|catch|continue|else|end|for|elseif|end_unwind_protect|global|gplot|gsplot|if|otherwise|persistent|replot|return|static|start|startat|stop|switch|try|until|unwind_protect|unwind_protect_cleanup|varargin|varargout|wait|while";
	var builtinFunctions = "abs|acos|acosh|all|angle|any|append|arg|argnames|asin|asinh|assignin|atan|atan2|atanh|atexit|bitand|bitmax|bitor|bitshift|bitxor|casesen|cat|ceil|cell|cell2struct|cellstr|char|class|clc|clear|clearplot|clg|closeplot|completion_matches|conj|conv|convmtx|cos|cosh|cumprod|cumsum|dbclear|dbstatus|dbstop|dbtype|dbwhere|deconv|det|dftmtx|diag|diary|disp|document|do_string_escapes|double|dup2|echo|edit_history|__end__|erf|erfc|ERRNO|error|__error_text__|error_text|eval|evalin|exec|exist|exit|exp|eye|fclose|fcntl|fdisp|feof|ferror|feval|fflush|fft|fgetl|fgets|fieldnames|file_in_loadpath|file_in_path|filter|find|find_first_of_in_loadpath|finite|fix|floor|fmod|fnmatch|fopen|fork|format|formula|fprintf|fputs|fread|freport|frewind|fscanf|fseek|ftell|func2str|functions|fwrite|gamma|gammaln|getegid|getenv|geteuid|getgid|getpgrp|getpid|getppid|getuid|glob|graw|gset|gshow|help|history|hold|home|horzcat|ifft|imag|inline|input|input_event_hook|int16|int32|int64|int8|intmax|intmin|inv|inverse|ipermute|isalnum|isalpha|isascii|isbool|iscell|iscellstr|ischar|iscntrl|iscomplex|isdigit|isempty|isfield|isfinite|isglobal|isgraph|ishold|isieee|isinf|iskeyword|islist|islogical|islower|ismatrix|isna|isnan|is_nan_or_na|isnumeric|isprint|ispunct|isreal|isspace|isstream|isstreamoff|isstruct|isupper|isvarname|isxdigit|kbhit|keyboard|kill|lasterr|lastwarn|length|lgamma|link|linspace|list|load|log|log10|lstat|lu|mark_as_command|mislocked|mkfifo|mkstemp|mlock|more|munlock|nargin|nargout|native_float_format|ndims|nth|numel|octave_config_info|octave_tmp_file_name|ones|pause|pclose|permute|pipe|popen|printf|__print_symbol_info__|__print_symtab_info__|prod|purge_tmp_files|putenv|puts|pwd|quit|rank|readdir|readlink|read_readline_init_file|real|rehash|rename|reshape|reverse|rmfield|roots|round|run_history|save|scanf|set|shell_cmd|show|sign|sin|sinh|size|sizeof|sleep|sort|source|splice|sprintf|sqrt|squeeze|sscanf|stat|str2func|streamoff|struct|struct2cell|sum|sumsq|symlink|system|tan|tanh|tilde_expand|tmpfile|tmpnam|toascii|__token_count__|tolower|toupper|type|typeinfo|uint16|uint32|uint64|uint8|umask|undo_string_escapes|unlink|unmark_command|usage|usleep|va_arg|va_start|vectorize|vertcat|vr_val|waitpid|warning|warranty|which|who|whos|zeros|airy|balance|besselh|besseli|besselj|besselk|bessely|betainc|chol|colloc|daspk|daspk_options|dasrt|dasrt_options|dassl|dassl_options|det|eig|endgrent|endpwent|expm|fft|fft2|fftn|fftw_wisdom|filter|find|fsolve|fsolve_options|gammainc|gcd|getgrent|getgrgid|getgrnam|getpwent|getpwnam|getpwuid|getrusage|givens|gmtime|hess|ifft|ifft2|ifftn|inv|inverse|kron|localtime|lpsolve|lpsolve_options|lsode|lsode_options|lu|max|min|minmax|mktime|odessa|odessa_options|pinv|qr|quad|quad_options|qz|rand|randn|schur|setgrent|setpwent|sort|sqrtm|strftime|strptime|svd|syl|time|abcddim|__abcddims__|acot|acoth|acsc|acsch|analdemo|anova|arch_fit|arch_rnd|arch_test|are|arma_rnd|asctime|asec|asech|autocor|autocov|autoreg_matrix|axis|axis2dlim|__axis_label__|bar|bartlett|bartlett_test|base2dec|bddemo|beep|bessel|beta|beta_cdf|betai|beta_inv|beta_pdf|beta_rnd|bin2dec|bincoeff|binomial_cdf|binomial_inv|binomial_pdf|binomial_rnd|bitcmp|bitget|bitset|blackman|blanks|bode|bode_bounds|__bodquist__|bottom_title|bug_report|buildssic|c2d|cart2pol|cart2sph|cauchy_cdf|cauchy_inv|cauchy_pdf|cauchy_rnd|cellidx|center|chisquare_cdf|chisquare_inv|chisquare_pdf|chisquare_rnd|chisquare_test_homogeneity|chisquare_test_independence|circshift|clock|cloglog|close|colormap|columns|com2str|comma|common_size|commutation_matrix|compan|complement|computer|cond|contour|controldemo|conv|cor|corrcoef|cor_test|cot|coth|cov|cputime|create_set|cross|csc|csch|ctime|ctrb|cut|d2c|damp|dare|date|dcgain|deal|deblank|dec2base|dec2bin|dec2hex|deconv|delete|DEMOcontrol|demoquat|detrend|dezero|dgkfdemo|dgram|dhinfdemo|diff|diffpara|dir|discrete_cdf|discrete_inv|discrete_pdf|discrete_rnd|dkalman|dlqe|dlqg|dlqr|dlyap|dmr2d|dmult|dot|dre|dump_prefs|duplication_matrix|durbinlevinson|empirical_cdf|empirical_inv|empirical_pdf|empirical_rnd|erfinv|__errcomm__|errorbar|__errplot__|etime|exponential_cdf|exponential_inv|exponential_pdf|exponential_rnd|f_cdf|fftconv|fftfilt|fftshift|figure|fileparts|findstr|f_inv|fir2sys|flipdim|fliplr|flipud|flops|f_pdf|fractdiff|frdemo|freqchkw|__freqresp__|freqz|freqz_plot|f_rnd|f_test_regression|fullfile|fv|fvl|gamma_cdf|gammai|gamma_inv|gamma_pdf|gamma_rnd|geometric_cdf|geometric_inv|geometric_pdf|geometric_rnd|gls|gram|gray|gray2ind|grid|h2norm|h2syn|hamming|hankel|hanning|hex2dec|hilb|hinf_ctr|hinfdemo|hinfnorm|hinfsyn|hinfsyn_chk|hinfsyn_ric|hist|hotelling_test|hotelling_test_2|housh|hsv2rgb|hurst|hypergeometric_cdf|hypergeometric_inv|hypergeometric_pdf|hypergeometric_rnd|image|imagesc|impulse|imshow|ind2gray|ind2rgb|ind2sub|index|int2str|intersection|invhilb|iqr|irr|isa|is_abcd|is_bool|is_complex|is_controllable|isdefinite|is_detectable|is_dgkf|is_digital|is_duplicate_entry|is_global|is_leap_year|isletter|is_list|is_matrix|is_observable|ispc|is_sample|is_scalar|isscalar|is_signal_list|is_siso|is_square|issquare|is_stabilizable|is_stable|isstr|is_stream|is_struct|is_symmetric|issymmetric|isunix|is_vector|isvector|jet707|kendall|kolmogorov_smirnov_cdf|kolmogorov_smirnov_test|kolmogorov_smirnov_test_2|kruskal_wallis_test|krylov|krylovb|kurtosis|laplace_cdf|laplace_inv|laplace_pdf|laplace_rnd|lcm|lin2mu|listidx|list_primes|loadaudio|loadimage|log2|logical|logistic_cdf|logistic_inv|logistic_pdf|logistic_regression|logistic_regression_derivatives|logistic_regression_likelihood|logistic_rnd|logit|loglog|loglogerr|logm|lognormal_cdf|lognormal_inv|lognormal_pdf|lognormal_rnd|logspace|lower|lqe|lqg|lqr|lsim|ltifr|lyap|mahalanobis|manova|mcnemar_test|mean|meansq|median|menu|mesh|meshdom|meshgrid|minfo|mod|moddemo|moment|mplot|mu2lin|multiplot|nargchk|nextpow2|nichols|norm|normal_cdf|normal_inv|normal_pdf|normal_rnd|not|nper|npv|ntsc2rgb|null|num2str|nyquist|obsv|ocean|ols|oneplot|ord2|orth|__outlist__|pack|packedform|packsys|parallel|paren|pascal_cdf|pascal_inv|pascal_pdf|pascal_rnd|path|periodogram|perror|place|playaudio|plot|plot_border|__plr__|__plr1__|__plr2__|__plt__|__plt1__|__plt2__|__plt2mm__|__plt2mv__|__plt2ss__|__plt2vm__|__plt2vv__|__pltopt__|__pltopt1__|pmt|poisson_cdf|poisson_inv|poisson_pdf|poisson_rnd|pol2cart|polar|poly|polyder|polyderiv|polyfit|polyinteg|polyout|polyreduce|polyval|polyvalm|popen2|postpad|pow2|ppplot|prepad|probit|prompt|prop_test_2|pv|pvl|pzmap|qconj|qcoordinate_plot|qderiv|qderivmat|qinv|qmult|qqplot|qtrans|qtransv|qtransvmat|quaternion|qzhess|qzval|randperm|range|rank|ranks|rate|record|rectangle_lw|rectangle_sw|rem|repmat|residue|rgb2hsv|rgb2ind|rgb2ntsc|rindex|rldemo|rlocus|roots|rot90|rotdim|rotg|rows|run_cmd|run_count|run_test|saveaudio|saveimage|sec|sech|semicolon|semilogx|semilogxerr|semilogy|semilogyerr|series|setaudio|setstr|shg|shift|shiftdim|sign_test|sinc|sinetone|sinewave|skewness|sombrero|sortcom|spearman|spectral_adf|spectral_xdf|spencer|sph2cart|split|ss|ss2sys|ss2tf|ss2zp|stairs|starp|statistics|std|stdnormal_cdf|stdnormal_inv|stdnormal_pdf|stdnormal_rnd|step|__stepimp__|stft|str2mat|str2num|strappend|strcat|strcmp|strerror|strjust|strrep|struct_contains|struct_elements|studentize|sub2ind|subplot|substr|subwindow|swap|swapcols|swaprows|sylvester_matrix|synthesis|sys2fir|sys2ss|sys2tf|sys2zp|sysadd|sysappend|syschnames|__syschnamesl__|syschtsam|__sysconcat__|sysconnect|syscont|__syscont_disc__|__sysdefioname__|__sysdefstname__|sysdimensions|sysdisc|sysdup|sysgetsignals|sysgettsam|sysgettype|sysgroup|__sysgroupn__|sysidx|sysmin|sysmult|sysout|sysprune|sysreorder|sysrepdemo|sysscale|syssetsignals|syssub|sysupdate|table|t_cdf|tempdir|tempname|texas_lotto|tf|tf2ss|tf2sys|__tf2sysl__|tf2zp|__tfl__|tfout|tic|t_inv|title|toc|toeplitz|top_title|t_pdf|trace|triangle_lw|triangle_sw|tril|triu|t_rnd|t_test|t_test_2|t_test_regression|tzero|tzero2|ugain|uniform_cdf|uniform_inv|uniform_pdf|uniform_rnd|union|unix|unpacksys|unwrap|upper|u_test|values|vander|var|var_test|vec|vech|version|vol|weibull_cdf|weibull_inv|weibull_pdf|weibull_rnd|welch_test|wgt1o|wiener_rnd|wilcoxon_test|xlabel|xor|ylabel|yulewalker|zgfmul|zgfslv|zginit|__zgpbal__|zgreduce|zgrownorm|zgscal|zgsgiv|zgshsr|zlabel|zp|zp2ss|__zp2ssg2__|zp2sys|zp2tf|zpout|z_test|z_test_2";
	var externalFunctions = "airy_Ai|airy_Ai_deriv|airy_Ai_deriv_scaled|airy_Ai_scaled|airy_Bi|airy_Bi_deriv|airy_Bi_deriv_scaled|airy_Bi_scaled|airy_zero_Ai|airy_zero_Ai_deriv|airy_zero_Bi|airy_zero_Bi_deriv|atanint|bchdeco|bchenco|bessel_il_scaled|bessel_In|bessel_In_scaled|bessel_Inu|bessel_Inu_scaled|bessel_jl|bessel_Jn|bessel_Jnu|bessel_kl_scaled|bessel_Kn|bessel_Kn_scaled|bessel_Knu|bessel_Knu_scaled|bessel_lnKnu|bessel_yl|bessel_Yn|bessel_Ynu|bessel_zero_J0|bessel_zero_J1|beta_gsl|bfgsmin|bisectionstep|builtin|bwfill|bwlabel|cell2csv|celleval|Chi|chol|Ci|clausen|conicalP_0|conicalP_1|conicalP_half|conicalP_mhalf|conv2|cordflt2|coupling_3j|coupling_6j|coupling_9j|csv2cell|csvconcat|csvexplode|cyclgen|cyclpoly|dawson|debye_1|debye_2|debye_3|debye_4|deref|dispatch|dispatch_help|display_fixed_operations|dlmread|ellint_Ecomp|ellint_Kcomp|ellipj|erfc_gsl|erf_gsl|erf_Q|erf_Z|_errcore|eta|eta_int|expint_3|expint_E1|expint_E2|expint_Ei|expm1|exp_mult|exprel|exprel_2|exprel_n|fabs|fangle|farg|fatan2|fceil|fconj|fcos|fcosh|fcumprod|fcumsum|fdiag|fermi_dirac_3half|fermi_dirac_half|fermi_dirac_inc_0|fermi_dirac_int|fermi_dirac_mhalf|fexp|ffloor|fimag|finitedifference|fixed|flog|flog10|fprod|freal|freshape|fround|fsin|fsinh|fsqrt|fsum|fsumsq|ftan|ftanh|full|gamma_gsl|gamma_inc|gamma_inc_P|gamma_inc_Q|gammainv_gsl|gammastar|gdet|gdiag|gexp|gf|gfilter|_gfweight|ginv|ginverse|glog|glu|gpick|gprod|grab|grank|graycomatrix|__grcla__|__grclf__|__grcmd__|greshape|__grexit__|__grfigure__|__grgetstat__|__grhold__|__grinit__|__grishold__|__grnewset__|__grsetgraph__|gsl_sf|gsqrt|gsum|gsumsq|gtext|gzoom|hazard|houghtf|hyperg_0F1|hzeta|is_complex_sparse|isfixed|isgalois|isprimitive|is_real_sparse|is_sparse|jpgread|jpgwrite|lambert_W0|lambert_Wm1|legendre_Pl|legendre_Plm|legendre_Ql|legendre_sphPlm|legendre_sphPlm_array|leval|listen|lnbeta|lncosh|lngamma_gsl|lnpoch|lnsinh|log_1plusx|log_1plusx_mx|log_erfc|lp|make_sparse|mark_for_deletion|medfilt1|newtonstep|nnz|numgradient|numhessian|pchip_deriv|pngread|pngwrite|poch|pochrel|pretty|primpoly|psi|psi_1_int|psi_1piy|psi_n|rand|rande|randn|randp|regexp|remez|reset_fixed_operations|rotate_scale|rsdec|rsenc|samin|SBBacksub|SBEig|SBFactor|SBProd|SBSolve|Shi|Si|sinc_gsl|spabs|sparse|spfind|spimag|spinv|splu|spreal|SymBand|synchrotron_1|synchrotron_2|syndtable|taylorcoeff|transport_2|transport_3|transport_4|transport_5|trisolve|waitbar|xmlread|zeta|zeta_int|aar|aarmam|ac2poly|ac2rc|acorf|acovf|addpath|ademodce|adim|adsmax|amodce|anderson_darling_cdf|anderson_darling_test|anovan|apkconst|append_save|applylut|ar2poly|ar2rc|arburg|arcext|arfit2|ar_spa|aryule|assert|au|aucapture|auload|auplot|aurecord|ausave|autumn|average_moments|awgn|azimuth|BandToFull|BandToSparse|base64encode|battery|bchpoly|bestblk|best_dir|best_dir_cov|betaln|bfgs|bfgsmin_example|bi2de|biacovf|bilinear|bisdemo|bispec|biterr|blkdiag|blkproc|bmpwrite|bone|bound_convex|boxcar|boxplot|brighten|bs_gradient|butter|buttord|bwborder|bweuler|bwlabel|bwmorph|bwselect|calendar|cceps|cdiff|cellstr|char|cheb|cheb1ord|cheb2ord|chebwin|cheby1|cheby2|chirp|clf|clip|cmpermute|cmunique|cohere|col2im|colfilt|colorgradient|comms|compand|complex|concat|conndef|content|contents|Contents|contourf|convhull|convmtx|cool|copper|corr2|cosets|count|covm|cplxpair|cquadnd|create_lookup_table|crule|crule2d|crule2dgen|csape|csapi|csd|csvread|csvwrite|ctranspose|cumtrapz|czt|d2_min|datenum|datestr|datevec|dct|dct2|dctmtx|de2bi|deal|decimate|decode|deg2rad|del2|delaunay|delaunay3|delta_method|demo|demodmap|deriv|detrend|dfdp|dftmtx|dhbar|dilate|dispatch|distance|dlmread|dlmwrite|dos|double|drawnow|durlev|dxfwrite|edge|edit|ellip|ellipdemo|ellipj|ellipke|ellipord|__ellip_ws|__ellip_ws_min|encode|eomday|erode|example|ExampleEigenValues|ExampleGenEigenValues|expdemo|expfit|eyediagram|factor|factorial|fail|fcnchk|feedback|fem_test|ff2n|fftconv2|fieldnames|fill|fill3|filter2|filtfilt|filtic|findsym|fir1|fir2|fixedpoint|flag|flag_implicit_samplerate|flattopwin|flix|float|fmin|fminbnd|fmins|fminunc|fnder|fnplt|fnval|fplot|freqs|freqs_plot|fsort|fullfact|FullToBand|funm|fzero|gammaln|gapTest|gaussian|gausswin|gconv|gconvmtx|gdeconv|gdftmtx|gen2par|geomean|getfield|getfields|gfft|gftable|gfweight|gget|gifft|ginput|gmm_estimate|gmm_example|gmm_obj|gmm_results|gmm_variance|gmm_variance_inefficient|gquad|gquad2d|gquad2d6|gquad2dgen|gquad6|gquadnd|grace_octave_path|gradient|grayslice|grep|grid|griddata|groots|grpdelay|grule|grule2d|grule2dgen|hadamard|hammgen|hankel|hann|harmmean|hilbert|histeq|histfit|histo|histo2|histo3|histo4|hot|hsv|hup|idct|idct2|idplot|idsim|ifftshift|im2bw|im2col|imadjust|imginfo|imhist|imnoise|impad|impz|imread|imrotate|imshear|imtranslate|imwrite|innerfun|inputname|interp|interp1|interp2|interpft|intersect|invest0|invest1|invfdemo|invfreq|invfreqs|invfreqz|inz|irsa_act|irsa_actcore|irsa_check|irsa_dft|irsa_dftfp|irsa_genreal|irsa_idft|irsa_isregular|irsa_jitsp|irsa_mdsp|irsa_normalize|irsa_plotdft|irsa_resample|irsa_rgenreal|isa|isbw|isdir|isequal|isfield|isgray|isind|ismember|isprime|isrgb|issparse|isunix|jet|kaiser|kaiserord|lambertw|lattice|lauchli|leasqr|leasqrdemo|legend|legendre|levinson|lin2mu|line_min|lloyds|lookup|lookup_table|lpc|lp_test|mad|magic|makelut|MakeShears|map|mat2gray|mat2str|mdsmax|mean2|medfilt2|meshc|minimize|minpol|mkpp|mktheta|mle_estimate|mle_example|mle_obj|mle_results|mle_variance|modmap|mu2lin|mvaar|mvar|mvfilter|mvfreqz|myfeval|nanmax|nanmean|nanmedian|nanmin|nanstd|nansum|ncauer|nchoosek|ncrule|ndims|nelder_mead_min|newmark|nlfilter|nlnewmark|__nlnewmark_fcn__|nmsmax|nonzeros|normplot|now|nrm|nthroot|nze|OCTAVE_FORGE_VERSION|ode23|ode45|ode78|optimset|ordfilt2|orient|pacf|padarray|parameterize|parcor|pareto|pascal|patch|pburg|pcg|pchip|pcolor|pcr|peaks|penddot|pendulum|perms|pie|pink|plot3|__plt3__|poly2ac|poly2ar|poly_2_ex|poly2mask|poly2rc|poly2sym|poly2th|polyarea|polyconf|polyder|polyderiv|polygcd|polystab|__power|ppval|prctile|prettyprint|prettyprint_c|primes|princomp|print|prism|proplan|pulstran|pwelch|pyulear|qaskdeco|qaskenco|qtdecomp|qtgetblk|qtsetblk|quad2dc|quad2dcgen|quad2dg|quad2dggen|quadc|quadg|quadl|quadndg|quantiz|quiver|rad2deg|rainbow|randerr|randint|randsrc|rat|rats|rc2ac|rc2ar|rc2poly|rceps|read_options|read_pdb|rectpuls|resample|rgb2gray|rk2fixed|rk4fixed|rk8fixed|rmfield|rmle|rmpath|roicolor|rosser|rotparams|rotv|rref|rsdecof|rsencof|rsgenpoly|samin_example|save_vrml|sbispec|scale_data|scatter|scatterplot|select_3D_points|selmo|setdiff|setfield|setfields|setxor|sftrans|sgolay|sgolayfilt|sinvest1|slurp_file|sortrows|sound|soundsc|spdiags|specgram|speed|speye|spfun|sphcat|spline|splot|spones|sprand|sprandn|spring|spstats|spsum|sp_test|sptest|spvcat|spy|std2|stem|str2double|strcmpi|stretchlim|strfind|strmatch|strncmp|strncmpi|strsort|strtok|strtoz|struct|strvcat|summer|sumskipnan|surf|surfc|sym2poly|symerr|symfsolve|tabulate|tar|temp_name|test|test_d2_min_1|test_d2_min_2|test_d2_min_3|test_ellipj|test_fminunc_1|testimio|test_inline_1|test_min_1|test_min_2|test_min_3|test_min_4|test_minimize_1|test_nelder_mead_min_1|test_nelder_mead_min_2|test_sncndn|test_struct|test_vmesh|test_vrml_faces|test_wpolyfit|text|textread|tf2zp|tfe|thfm|tics|toeplitz|toggle_grace_use|transpose|trapz|triang|tril|trimmean|tripuls|trisolve|triu|tsademo|tsearchdemo|ucp|uintlut|unique|unix|unmkpp|unscale_parameters|vec2mat|view|vmesh|voronoi|voronoin|vrml_arrow|vrml_Background|vrml_browse|vrml_cyl|vrml_demo_tutorial_1|vrml_demo_tutorial_2|vrml_demo_tutorial_3|vrml_demo_tutorial_4|vrml_ellipsoid|vrml_faces|vrml_flatten|vrml_frame|vrml_group|vrml_kill|vrml_lines|vrml_material|vrml_parallelogram|vrml_PointLight|vrml_points|vrml_select_points|vrml_surf|vrml_text|vrml_thick_surf|vrml_transfo|wavread|wavwrite|weekday|wgn|white|wilkinson|winter|wpolyfit|wpolyfitdemo|write_pdb|wsolve|xcorr|xcorr2|xcov|xlsread|xmlwrite|y2res|zero_count|zoom|zp2tf|zplane|zscore";
	var operators = "\\s*(?:@|'|\\+\\+|--|\\+=|-=|\\*=|\\/=|\\^=|\\.\\*=|\\.\\/=|\\.\\^=|==|~=|!=|>|>=|<|<=|&|&&|:|\\||\\|\\||\\+|-|\\*|\\.\\*|/|\\./|\\\\|\\.\\\\|\\^|\\.\\^|!)\\s*";

	var keywordMapper = this.createKeywordMapper({
		"keyword.control": keywords,
		"constant.language": builtinConstants,
		"constant.language.boolean": "true|false"
	}, "variable");
	var functionMapper = this.createKeywordMapper({
		"support.function": builtinFunctions+"|"+externalFunctions,
		"keyword.control": keywords
	}, "identifier");
	
	var qstringInterior = "(?:(?:\\\\.)|(?:[^'\\\\]))*?";
	var qqstringInterior = '(?:(?:\\\\.)|(?:[^"\\\\]))*?';
	var realNumber = "(?:[+-]\\s*)?(?:(?:\\.\\d+)|(?:\\d+(?:\\.\\d*)?))(?:[eE][+-]?\\d+)?";
	var complexNumber = realNumber+"\\s*[+-]\\s*"+realNumber+"i";
	var variable = "[a-zA-Z]\\w*";
	var variableList = "(?:\\s*"+variable+"\\s*,?\\s*)";
	this.$rules = {
		"start" : [
			{   // multi line comment start: %{
				token: "comment",
				regex: "^\\s*%\\{\\s*$",
				next: "percent_block_comment"
			},
			{   // multi line comment start: #{
				token: "comment",
				regex: "^\\s*#\\{\\s*$",
				next: "hash_block_comment"
			},
			{   // single line comment
				token: "comment",
				regex: "[#%].*$"
			},
			{   // single line string: '
				token: "string.quoted.single",
				regex: "'"+qstringInterior+"'"
			},
			{   // single line string: "
				token: "string.quoted.double",
				regex: '"'+qqstringInterior+'"'
			},
			{   // multi line string start: '
				token: "string.quoted.single",
				regex: "'"+qstringInterior+"\\\\$",
				next: "qstring"
			},
			{   // multi line string start: "
				token: "string.quoted.double",
				regex: '"'+qqstringInterior+"\\\\$",
				next: "qqstring"
			},
			{   // function declaration
				token: ["keyword", "text", "identifier", "text", "keyword.operator", "text", "entity.name.function", "text", "lparen.function"],
				regex: "(function)(\\s*)((?:\\["+variableList+"*\\])|(?:"+variableList+"*))?(\\s*)(=)(\\s*)("+variable+")(\\s*)(\\()",
				next: "function_parameters"
			},
			{   // variable declaration
				token: ["text", "entity.name", "text", "keyword.operator"],
				regex: "((?:^|;)\\s*)("+variable+")(\\s*)(=)"
			},
			{   // complex numbers
				token: "constant.numeric",
				regex: complexNumber+"\\b"
			},
			{   // real numbers
				token: "constant.numeric",
				regex: realNumber+"\\b"
			},
			{   // end keyword
				token: "keyword.control",
				regex: "end\\w*\\b",
			},
			{   // keywords
				token: keywordMapper,
				regex: "\\w+(?!\\s*\\()\\b"
			},
			{   // keywords
				token: functionMapper,
				regex: "\\w+(?=\\s*\\()\\b"
			},
			{   // operators
				token: "keyword.operator",
				regex: operators
			},
			{   // left brackets
				token: "lparen",
				regex : "[[({]"
			},
			{   // right brackets
				token: "rparen",
				regex : "[\\])}]"
			}
		],
		"percent_block_comment" : [
			{   // multi line comment end: %}
				token: "comment",
				regex: "^\\s*%\\}\\s*$",
				next: "start"
			},
			{
				defaultToken: "comment"
			}
		],
		"hash_block_comment" : [
			{   // multi line comment end: #}
				token: "comment",
				regex: "^\\s*#\\}\\s*$",
				next: "start"
			},
			{
				defaultToken: "comment"
			}
		],
		"qstring" : [
			{   // multi line string end: '
				token: "string.quoted.single",
				regex: qstringInterior+"'",
				next: "start"
			},
			{
				token: "string.quoted.single",
				regex: qstringInterior+"\\\\$"
			}
		],
		"qqstring" : [
			{   // multi line string end: "
				token: "string.quoted.double",
				regex: qqstringInterior+'"',
				next: "start"
			},
			{
				token: "string.quoted.double",
				regex: qqstringInterior+"\\\\$"
			}
		],
		"function_parameters" : [
			{   // default parameter declaration
				token: ["text", "entity.name", "text", "keyword.operator", "text"],
				regex: "((?:^|,|\\b)\\s*)("+variable+")(\\s*)(=)(\\s*)",
				next: "function_parameter_variable"
			},
			{	// no-default parameter declaration
				token: ["text", "entity.name"],
				regex: "((?:^|,|\\b)\\s*)("+variable+")"
			},
			{	// end of function declaration
				token: "rparen.function",
				regex: "\\)",
				next: "after_function_declaration"
			},
			{	// catchall
				token: "invalid.illegal",
				regex: "[^\\s,]+",
				next: "start"
			}
		],
		"function_parameter_variable" : [
			{   // complex numbers
				token: "constant.numeric",
				regex: complexNumber+"\\b",
				next: "function_parameters"
			},
			{   // real numbers
				token: "constant.numeric",
				regex: realNumber+"\\b",
				next: "function_parameters"
			},
			{   // single line string: '
				token: "string.quoted.single",
				regex: "'"+qstringInterior+"'",
				next: "function_parameters"
			},
			{   // single line string: "
				token: "string.quoted.double",
				regex: '"'+qqstringInterior+'"',
				next: "function_parameters"
			},
			{   // keywords (incl. constants)
				token: keywordMapper,
				regex: "\\w+(?!\\s*\\()\\b",
				next: "function_parameters"
			},
			{	// catchall
				token: "invalid.illegal",
				regex: ".*",
				next: "function_parameters"
			}
		],
		"after_function_declaration" : [
			{
				token: "comment.doc",
				regex: "^\\s*[#%].*$"
			},
			{
				regex: "(?=^)",
				next: "start"
			}
		]
	};
};

oop.inherits(OctaveHighlightRules, TextHighlightRules);

exports.OctaveHighlightRules = OctaveHighlightRules;

});
